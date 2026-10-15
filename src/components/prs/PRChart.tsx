import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { PersonalRecord } from '../../types/workout';

interface PRChartProps {
  pr: PersonalRecord;
}

export const PRChart: React.FC<PRChartProps> = ({ pr }) => {
  if (!pr.history || pr.history.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-xs text-zinc-500 font-mono">
        Sin historial suficiente para graficar progresión.
      </div>
    );
  }

  const data = pr.history.map((item, index) => ({
    name: item.date ? item.date.slice(5) : `#${index + 1}`,
    peso: item.weight,
    estimado1RM: item.estimated1RM,
    reps: item.reps,
    fullDate: item.date
  }));

  return (
    <div className="w-full h-52 sm:h-60 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis 
            dataKey="name" 
            stroke="#71717a" 
            fontSize={11} 
            tickLine={false} 
          />
          <YAxis 
            stroke="#71717a" 
            fontSize={11} 
            tickLine={false}
            domain={['dataMin - 5', 'dataMax + 5']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              borderColor: '#eab308',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '12px'
            }}
            formatter={(value: any, name: any) => {
              const unit = pr.weightUnit || 'kg';
              if (name === 'estimado1RM') return [`${value} ${unit}`, '1RM Estimado'];
              if (name === 'peso') return [`${value} ${unit}`, 'Carga Levantada'];
              return [value, name];
            }}
            labelFormatter={(label, payload) => {
              if (payload && payload[0] && payload[0].payload) {
                return `Fecha: ${payload[0].payload.fullDate} (${payload[0].payload.reps} reps)`;
              }
              return label;
            }}
          />
          <Line 
            type="monotone" 
            dataKey="estimado1RM" 
            stroke="#eab308" 
            strokeWidth={3}
            dot={{ fill: '#eab308', r: 4 }} 
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="peso" 
            stroke="#3b82f6" 
            strokeWidth={2} 
            strokeDasharray="4 4"
            dot={{ fill: '#3b82f6', r: 3 }} 
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-center items-center gap-6 mt-2 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-yellow-400">
          <span className="w-3 h-0.5 bg-yellow-400 inline-block" />
          <span>1RM Estimado</span>
        </div>
        <div className="flex items-center gap-1.5 text-blue-400">
          <span className="w-3 h-0.5 bg-blue-400 border-t border-dashed inline-block" />
          <span>Carga Directa</span>
        </div>
      </div>
    </div>
  );
};
