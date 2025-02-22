/**
=========================================================
* SocialFlow - v2.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/nextjs-material-dashboard-pro
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

function configs(labels, datasets) {
  const formattedDatasets = Array.isArray(datasets) ? datasets : [datasets];

  return {
    data: {
      labels,
      datasets: formattedDatasets.map((dataset) => ({
        label: dataset.label || "Dataset",
        tension: 0.4,
        pointRadius: 5,
        pointBorderColor: "transparent",
        pointBackgroundColor: dataset.borderColor || "rgba(255, 255, 255, .8)",
        borderColor: dataset.borderColor || "rgba(255, 255, 255, .8)",
        borderWidth: 4,
        backgroundColor: dataset.backgroundColor || "transparent",
        fill: true,
        data: dataset.data || [],
        maxBarThickness: 6,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true, // Enable legend
          position: "bottom", // Move labels under the chart
          labels: {
            boxWidth: 12, // Reduce label box size
            padding: 10, // Add spacing to reduce clutter
            font: {
              size: 14, // Adjust font size for better readability
            },
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
      scales: {
        y: {
          grid: {
            drawBorder: false,
            display: true,
            drawOnChartArea: true,
            drawTicks: false,
            borderDash: [5, 5],
            color: "rgba(255, 255, 255, .2)",
          },
          ticks: {
            display: true,
            color: "#f8f9fa",
            padding: 10,
            font: {
              size: 14,
              weight: 300,
              family: "Roboto",
              style: "normal",
              lineHeight: 2,
            },
          },
        },
        x: {
          grid: {
            drawBorder: false,
            display: false,
            drawOnChartArea: false,
            drawTicks: false,
            borderDash: [5, 5],
          },
          ticks: {
            display: true,
            color: "#f8f9fa",
            padding: 10,
            font: {
              size: 14,
              weight: 300,
              family: "Roboto",
              style: "normal",
              lineHeight: 2,
            },
          },
        },
      },
    },
  };
}

export default configs;
