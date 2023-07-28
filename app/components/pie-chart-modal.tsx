import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import Modal from 'react-modal';  // assuming you're using 'react-modal'

ChartJS.register(ArcElement, Tooltip, Legend);

type PieChartData = {
  data: number[];
  backgroundColor: string[];
  borderColor: string[];
  borderWidth: number;
};

export type PieChartDataset = {
  chartLabel: string;
  labels: string[];
  datasets: PieChartData[];
};

interface PieChartModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  chartProps: PieChartDataset | undefined;
}

const PieChartModal: React.FC<PieChartModalProps>= ({isOpen, onRequestClose, chartProps}) => {
  if (!chartProps) {
    return null;
  }

// Ensure every dataset has a borderColor and borderWidth
const datasets = chartProps.datasets.map(dataset => ({
  ...dataset,
  borderColor: dataset.borderColor ?? dataset.backgroundColor,
  borderWidth: dataset.borderWidth ?? 1,
}));

const chartData = {
  chartLabel: chartProps.chartLabel,
  labels: chartProps.labels,
  datasets,
};

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} ariaHideApp={false}>
      <button onClick={onRequestClose}>Close</button>
      <Pie data={chartData} />
    </Modal>
  );
};

export default PieChartModal;