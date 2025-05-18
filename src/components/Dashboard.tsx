import React, { useMemo } from 'react';
import { GitPullRequest, PackageCheck, TestTube2, Workflow, FileCheck2, Clock, Package, FileSpreadsheet } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, plugins } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ChartDataLabels);

interface DashboardProps {
  data: any[][];
}

interface StatusCount {
  [key: string]: number;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const countValues = (rows: any[][], columnIndex: number): StatusCount => {
    return rows.reduce((acc: StatusCount, row) => {
      const value = row[columnIndex] || 'Not Specified';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  };

  const analyzeCmanPackages = (rows: any[][], columnIndex: number): StatusCount => {
    return rows.reduce((acc: StatusCount, row) => {
      const packages = (row[columnIndex] || '').split(',').map((pkg: string) => pkg.trim());
      packages.forEach((pkg: string) => {
        if (pkg.startsWith('FS') || pkg.startsWith('SEC')) {
          acc[pkg] = (acc[pkg] || 0) + 1;
        }
      });
      return acc;
    }, {});
  };

  const analyzeServiceNowChanges = (rows: any[][], columnIndex: number): StatusCount => {
    return rows.reduce((acc: StatusCount, row) => {
      const changes = (row[columnIndex] || '').split(',').map((change: string) => change.trim());
      changes.forEach((change: string) => {
        if (change.startsWith('CHG')) {
          acc[change] = (acc[change] || 0) + 1;
        }
      });
      return acc;
    }, {});
  };

  const stats = useMemo(() => {
    if (!data || data.length <= 1) return null;
    
    const headers = data[0];
    const rows = data.slice(1);

    // Find column indices
    const statusIndex = headers.findIndex(h => h === 'Project Status');
    const approvalIndex = headers.findIndex(h => h === 'Requirements Approval Status');
    const smeIndex = headers.findIndex(h => h === 'SME Design Required?');
    const devIndex = headers.findIndex(h => h === 'Development Status');
    const testIndex = headers.findIndex(h => h === 'Testing Status');
    const uatIndex = headers.findIndex(h => h === 'Extension Required?');
    const cmanIndex = headers.findIndex(h => h === 'CMAN Package(s)');
    const snowIndex = headers.findIndex(h => h === 'ServiceNow Change(s)');

    return {
      totalProjects: rows.length,
      projectStatus: countValues(rows, statusIndex),
      approvalStatus: countValues(rows, approvalIndex),
      smeReviews: countValues(rows, smeIndex),
      developmentStatus: countValues(rows, devIndex),
      testingStatus: countValues(rows, testIndex),
      uatExtensions: countValues(rows, uatIndex),
      cmanPackages: analyzeCmanPackages(rows, cmanIndex),
      serviceNowChanges: analyzeServiceNowChanges(rows, snowIndex)
    };
  }, [data]);

  const createChartData = (data: StatusCount, title: string) => ({
    labels: Object.keys(data),
    datasets: [{
      label: title,
      data: Object.entries(data)
        .sort(([, a], [, b]) => a - b)
        .map(([, value]) => value),
      backgroundColor: [
        'rgba(54, 162, 235, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(255, 99, 132, 0.6)',
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(255, 99, 132, 1)',
      ],
      borderWidth: 1,
    }],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        display: true
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold' as const,
          size: 11
        },
        formatter: (value: number, ctx: any) => {
          const dataset = ctx.chart.data.datasets[0];
          const total = dataset.data.reduce((acc: number, data: number) => acc + data, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${percentage}%`;
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const dataset = context.dataset;
            const total = dataset.data.reduce((acc: number, data: number) => acc + data, 0);
            const value = dataset.data[context.dataIndex];
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  if (!stats) return null;

  const renderStatusCard = useMemo(() => (title: string, data: StatusCount, icon: React.ReactNode, colorClass: string, chartType: 'pie' | 'bar' = 'pie') => {
    // Sort data by values
    const sortedData = Object.fromEntries(
      Object.entries(data).sort(([, a], [, b]) => a - b)
    );
    
    const total = Object.values(data).reduce((sum, count) => sum + count, 0);
    
    return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 text-sm font-medium">{title} (Total: {total})</h3>
        <div className={`${colorClass} p-2 rounded-lg`}>
          {icon}
        </div>
      </div>
      <div style={{ height: '250px' }} className="mb-4">
        {chartType === 'pie' ? (
          <Pie 
            data={createChartData(sortedData, title)} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                datalabels: {
                  display: true
                }
              }
            }}
          />
        ) : (
          <Bar data={createChartData(sortedData, title)} options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              datalabels: {
                display: false
              }
            }
          }} />
        )}
      </div>
      <div className="space-y-2">
        {Object.entries(sortedData).map(([status, count]) => (
          <div key={status} className="flex justify-between items-center">
            <div className="flex items-start w-full">
              <div className="text-sm text-gray-600 min-w-[200px]">{status}</div>
              <div className="font-semibold text-gray-800">
              {count} ({((count / Object.values(data).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  }, []);

  const chartData = useMemo(() => ({
    projectStatus: createChartData(stats.projectStatus, 'Project Status'),
    approvalStatus: createChartData(stats.approvalStatus, 'Functional Requirements Approval'),
    smeReviews: createChartData(stats.smeReviews, 'SME Reviews'),
    developmentStatus: createChartData(stats.developmentStatus, 'Development Status'),
    testingStatus: createChartData(stats.testingStatus, 'Testing Status'),
    uatExtensions: createChartData(stats.uatExtensions, 'UAT Extensions'),
    cmanPackages: createChartData(stats.cmanPackages, 'CMAN Packages'),
    serviceNowChanges: createChartData(stats.serviceNowChanges, 'ServiceNow Changes')
  }), [stats, createChartData]);

  const options = useMemo(() => ({
    ...chartOptions,
    animation: {
      duration: 0 // 禁用动画以减少闪烁
    },
    layout: {
      padding: 20
    }
  }), []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {renderStatusCard(
        'Project Status',
        stats.projectStatus,
        <GitPullRequest className="h-5 w-5 text-blue-700" />,
        'bg-blue-50',
        'bar'
      )}

      {renderStatusCard(
        'Functional Requirements Approval',
        stats.approvalStatus,
        <FileCheck2 className="h-5 w-5 text-green-700" />,
        'bg-green-50',
        'pie'
      )}

      {renderStatusCard(
        'SME Reviews',
        stats.smeReviews,
        <Workflow className="h-5 w-5 text-purple-700" />,
        'bg-purple-50',
        'pie'
      )}

      {renderStatusCard(
        'Development Status',
        stats.developmentStatus,
        <PackageCheck className="h-5 w-5 text-orange-700" />,
        'bg-orange-50',
        'bar'
      )}

      {renderStatusCard(
        'Testing Status',
        stats.testingStatus,
        <TestTube2 className="h-5 w-5 text-teal-700" />,
        'bg-teal-50',
        'bar'
      )}

      {renderStatusCard(
        'UAT Extensions',
        stats.uatExtensions,
        <Clock className="h-5 w-5 text-red-700" />,
        'bg-red-50',
        'pie'
      )}

      {renderStatusCard(
        'CMAN Packages',
        stats.cmanPackages,
        <Package className="h-5 w-5 text-indigo-700" />,
        'bg-indigo-50',
        'bar'
      )}

      {renderStatusCard(
        'ServiceNow Changes',
        stats.serviceNowChanges,
        <FileSpreadsheet className="h-5 w-5 text-cyan-700" />,
        'bg-cyan-50',
        'bar'
      )}
    </div>
  );
};

export default Dashboard;