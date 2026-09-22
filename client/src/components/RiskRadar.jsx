import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function RiskRadar({ breakdown }) {
  // Default values if breakdown is omitted
  const dataValues = breakdown ? [
    breakdown.payment_demands || 0,
    breakdown.domain_authenticity || 0,
    breakdown.language_urgency || 0,
    breakdown.salary_anomaly || 0,
    breakdown.contact_verification || 0,
  ] : [20, 30, 40, 20, 10];

  const data = {
    labels: [
      'Payment Demand',
      'Domain Rep',
      'Language/Urgency',
      'Salary Anomaly',
      'Contact Verification',
    ],
    datasets: [
      {
        label: 'Threat Factor Value',
        data: dataValues,
        backgroundColor: 'rgba(0, 240, 255, 0.2)',
        borderColor: '#00F0FF',
        borderWidth: 2,
        pointBackgroundColor: '#8A2BE2',
        pointBorderColor: '#00F0FF',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#00F0FF',
      },
    ],
  };

  const options = {
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: {
          color: '#94A3B8',
          font: { size: 10, family: 'Inter' },
        },
        ticks: {
          display: false,
          max: 100,
          min: 0,
        },
      },
    },
    plugins: {
      legend: { display: false },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
      <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">Risk Vector Breakdown</h3>
      <div className="h-56 w-full relative">
        <Radar data={data} options={options} />
      </div>
    </div>
  );
}