'use client'

import { Message } from 'ai/react'
import { useChat } from 'ai/react'
import { ChatRequest, FunctionCallHandler, nanoid } from 'ai'
import { useState } from 'react';
import PieChartModal, { PieChartDataset } from '../components/pie-chart-modal';

export default function Chat() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartProps, setChartProps] = useState<PieChartDataset>();

  console.log('chartProps', chartProps)

  const functionCallHandler: FunctionCallHandler = async (
    chatMessages,
    functionCall
  ) => {
    if (functionCall.name === 'eval_code_in_browser') {
      if (functionCall.arguments) {
        // Parsing here does not always work since it seems that some characters in generated code aren't escaped properly.
        const parsedFunctionCallArguments: { code: string } = JSON.parse(
          functionCall.arguments
        )
        // WARNING: Do NOT do this in real-world applications!
        eval(parsedFunctionCallArguments.code)
        const functionResponse = {
          messages: [
            ...chatMessages,
            {
              id: nanoid(),
              name: 'eval_code_in_browser',
              role: 'function' as const,
              content: parsedFunctionCallArguments.code
            }
          ]
        }
        return functionResponse
      }
    }

    if (functionCall.name === 'open_pie_chart_modal' && functionCall.arguments) {
      console.log('functionCall.arguments for open pie chart modal', functionCall.arguments)
      const chartPropsFromFunctionCall: PieChartDataset = JSON.parse(functionCall.arguments);
      setChartProps(chartPropsFromFunctionCall);
      setIsModalOpen(true);
      return {
        messages: [
          ...chatMessages,
          {
            id: nanoid(),
            name: 'open_pie_chart_modal',
            role: 'function' as const,
            content: functionCall.arguments
          }
        ]
      }
    }
  }

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat-with-functions',
    experimental_onFunctionCall: functionCallHandler
  })

  // Generate a map of message role to text color
  const roleToColorMap: Record<Message['role'], string> = {
    system: 'red',
    user: 'black',
    function: 'blue',
    assistant: 'green'
  }

  return (
    <>
          <PieChartModal
        isOpen={isModalOpen} 
        onRequestClose={() => setIsModalOpen(false)} 
        chartProps={chartProps}
      />
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.length > 0
        ? messages.map((m: Message) => (
            <div
              key={m.id}
              className="whitespace-pre-wrap"
              style={{ color: roleToColorMap[m.role] }}
            >
              <strong>{`${m.role}: `}</strong>
              {m.content || JSON.stringify(m.function_call)}
              <br />
              <br />
            </div>
          ))
        : null}
      <div id="chart-goes-here"></div>

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
    </>
  )
}
