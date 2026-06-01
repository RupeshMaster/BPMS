import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

export const StockTrendChart = ({ data }) => {
  // Default mock trend data if backend is empty
  const defaultData = [
    { day: 'Mon', Petrol: 9000, Diesel: 14000 },
    { day: 'Tue', Petrol: 8800, Diesel: 13500 },
    { day: 'Wed', Petrol: 9500, Diesel: 13000 },
    { day: 'Thu', Petrol: 8400, Diesel: 12500 },
    { day: 'Fri', Petrol: 9200, Diesel: 14200 },
    { day: 'Sat', Petrol: 8900, Diesel: 13800 },
    { day: 'Sun', Petrol: 8450, Diesel: 12230 }
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="w-full h-[13.75rem] font-mono text-[0.75rem] bg-white rounded-lg p-2 select-none">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" stroke="#a8a8a8" />
          <YAxis stroke="#a8a8a8" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #d9d9d9', borderRadius: '0.75rem' }} 
            labelClassName="font-bold text-bp-navy"
          />
          <Legend iconType="circle" />
          <Line 
            type="monotone" 
            dataKey="Petrol" 
            stroke="#f54800" 
            strokeWidth={3} 
            activeDot={{ r: 8 }} 
            dot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="Diesel" 
            stroke="#165dfc" 
            strokeWidth={3} 
            activeDot={{ r: 8 }} 
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
export default StockTrendChart;
