import React, { useMemo, useRef, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import './SentimentResults.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const SentimentResults = ({ results }) => {
  const stats = useMemo(() => {
    const positive = results.results.filter(r => r.sentiment === 'positive').length;
    const negative = results.results.filter(r => r.sentiment === 'negative').length;
    const neutral = results.results.filter(r => r.sentiment === 'neutral').length;
    const total = results.results.length;

    const avgConfidence = results.results.reduce((sum, r) => sum + r.confidence, 0) / total;

    return { positive, negative, neutral, total, avgConfidence };
  }, [results]);

  const chartRef = useRef(null);

  // Custom plugin to draw total in the center
  useEffect(() => {
    const centerTextPlugin = {
      id: 'centerText',
      afterDraw(chart) {
        const { ctx, chartArea: { width, height } } = chart;
        const total = stats.total;
        if (!width || !height) return;
        const styles = getComputedStyle(document.documentElement);
        const primaryText = styles.getPropertyValue('--text-primary')?.trim() || '#0F172A';
        const secondaryText = styles.getPropertyValue('--text-secondary')?.trim() || '#64748B';
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = secondaryText;
        ctx.font = '600 14px Inter, system-ui, sans-serif';
        ctx.fillText('Total', width / 2, height / 2 - 8);
        ctx.fillStyle = primaryText;
        ctx.font = '800 24px Inter, system-ui, sans-serif';
        ctx.fillText(String(total), width / 2, height / 2 + 16);
        ctx.restore();
      }
    };
    ChartJS.register(centerTextPlugin);
    return () => {
      ChartJS.unregister(centerTextPlugin);
    };
  }, [stats.total]);

  const chartData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [stats.positive, stats.neutral, stats.negative],
        backgroundColor: [
          'rgba(34, 197, 94, 0.9)',   // Positive: emerald
          'rgba(59, 130, 246, 0.9)',  // Neutral: blue
          'rgba(239, 68, 68, 0.9)',   // Negative: red
        ],
        borderColor: '#FFFFFF',
        borderWidth: 3,
        hoverOffset: 14,
        spacing: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#E2E8F0',
        bodyColor: '#F8FAFC',
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = ((value / stats.total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1200,
      easing: 'easeOutQuart'
    },
  };

  const downloadCSV = () => {
    const headers = ['Original Review', 'Cleaned Text', 'Sentiment', 'Confidence'];
    const rows = results.results.map(r => [
      `"${r.originalReview.replace(/"/g, '""')}"`,
      `"${r.cleanedText.replace(/"/g, '""')}"`,
      r.sentiment,
      r.confidence
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sentiment_analysis_results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="sentiment-results">
      <h2>📊 Step 2: Sentiment Analysis Results</h2>
      
      <div className="metrics-grid">
        <div className="metric-card positive">
          <div className="metric-icon">😊</div>
          <div className="metric-content">
            <h3>Positive</h3>
            <p className="metric-value">{stats.positive}</p>
            <p className="metric-percentage">{((stats.positive / stats.total) * 100).toFixed(1)}%</p>
          </div>
        </div>

        <div className="metric-card neutral">
          <div className="metric-icon">😐</div>
          <div className="metric-content">
            <h3>Neutral</h3>
            <p className="metric-value">{stats.neutral}</p>
            <p className="metric-percentage">{((stats.neutral / stats.total) * 100).toFixed(1)}%</p>
          </div>
        </div>

        <div className="metric-card negative">
          <div className="metric-icon">😞</div>
          <div className="metric-content">
            <h3>Negative</h3>
            <p className="metric-value">{stats.negative}</p>
            <p className="metric-percentage">{((stats.negative / stats.total) * 100).toFixed(1)}%</p>
          </div>
        </div>

        <div className="metric-card confidence">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <h3>Avg Confidence</h3>
            <p className="metric-value">{(stats.avgConfidence * 100).toFixed(1)}%</p>
            <p className="metric-percentage">Across {stats.total} reviews</p>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <h3>Sentiment Distribution</h3>
        <div className="chart-container">
          <Doughnut ref={chartRef} data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="download-section">
        <button className="download-button" onClick={downloadCSV}>
          ⬇️ Download Results (CSV)
        </button>
      </div>
    </div>
  );
};

export default SentimentResults;
