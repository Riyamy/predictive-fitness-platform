import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/activities')
      .then(res => res.json())
      .then(data => setData(data));
  }, []);

  const chartData = {
    labels: data.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [{
      label: 'Performance',
      data: data.map(item => item.performance),
      borderColor: 'blue',
      fill: false
    }]
  };

  return (
    <div>
      <h2>Performance Dashboard</h2>
      <Line data={chartData} />
    </div>
  );
}

export default Dashboard;
