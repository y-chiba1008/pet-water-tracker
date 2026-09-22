import { Info } from 'lucide-react'
import { format, isSameDay } from 'date-fns'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type ChartPoint = {
  date: string
  amountMl: number
}

type LineChartViewProps = {
  series: ChartPoint[]
  extremes: { maxMl: number; minMl: number } | null
  today?: Date
}

function parseLocalDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatAxisDate(dateKey: string, today: Date): string {
  const date = parseLocalDateKey(dateKey)
  if (isSameDay(date, today)) {
    return '今日'
  }
  return format(date, 'M/d')
}

export function LineChartView({
  series,
  extremes,
  today = new Date(),
}: LineChartViewProps) {
  const chartData = series.map((point) => ({
    ...point,
    label: formatAxisDate(point.date, today),
  }))

  const yMax = Math.max(extremes?.maxMl ?? 0, 50)
  const yDomainMax = Math.ceil(yMax / 50) * 50 || 50

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2 shadow-[0_2px_8px_-2px_rgba(120,113,108,0.06)]">
        <div className="flex flex-col">
          <span className="text-[11px] leading-[14px] font-medium text-[#78716C]">
            期間固定表示
          </span>
          <span className="font-heading text-base leading-6 font-semibold text-[#292524]">
            直近30日間の飲水量推移
          </span>
        </div>
        <span className="rounded-full bg-[#F5EFEB] px-2.5 py-1 text-[11px] leading-[14px] font-medium text-[#78716C]">
          30日間
        </span>
      </div>

      <div className="flex flex-col rounded-xl bg-white p-4 shadow-[0_2px_8px_-2px_rgba(120,113,108,0.06)]">
        <div className="flex items-center justify-between pb-2 text-[#78716C]">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#38BDF8]" />
            <span className="text-[11px] leading-[14px] font-medium">
              日別合計飲水量 (ml)
            </span>
          </div>
          {extremes ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] leading-[14px] font-medium">
                最高:{' '}
                <strong className="text-[#292524]">{extremes.maxMl}ml</strong>
              </span>
              <span className="text-[11px] leading-[14px] font-medium">
                最低:{' '}
                <strong className="text-[#292524]">{extremes.minMl}ml</strong>
              </span>
            </div>
          ) : (
            <span className="text-[11px] leading-[14px] font-medium">
              記録なし
            </span>
          )}
        </div>

        <div className="mt-1 h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="chartWaterGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="#FAF7F2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="#E7DFD8"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: '#78716C', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#E7DFD8' }}
                interval="preserveStartEnd"
                minTickGap={28}
              />
              <YAxis
                domain={[0, yDomainMax]}
                width={32}
                tick={{ fill: '#A8A29E', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid #E7DFD8',
                  boxShadow: '0 8px 20px -4px rgba(120, 113, 108, 0.12)',
                  fontSize: 12,
                }}
                formatter={(value) => [`${String(value)}ml`, '合計']}
                labelFormatter={(label) => String(label)}
              />
              <Area
                type="monotone"
                dataKey="amountMl"
                stroke="#0284C7"
                strokeWidth={2.5}
                fill="url(#chartWaterGradient)"
                dot={false}
                activeDot={{ r: 5, fill: '#38BDF8', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 flex items-center gap-1 pt-1 text-xs leading-[18px] text-[#78716C]">
          <Info className="size-4 text-[#0284C7]" strokeWidth={1.75} />
          直近30日間の合計値を自動集計しています。
        </div>
      </div>
    </div>
  )
}
