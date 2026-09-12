import React from 'react'

export default function TimeSelector({ value, onChange }: {
  value: string
  onChange: (val: string) => void
}) {
  const [hour, setHour] = React.useState(value.split(':')[0])
  const [minute, setMinute] = React.useState(value.split(':')[1])

  React.useEffect(() => {
    onChange(`${hour}:${minute}`)
  }, [hour, minute])

  return (
    <div className="flex gap-2 items-center">
      <select
        className="border rounded px-2 py-2 text-sm"
        value={hour}
        onChange={(e) => setHour(e.target.value)}
      >
        {Array.from({ length: 24 }, (_, i) => (
          <option key={i} value={i.toString().padStart(2, '0')}>
            {i.toString().padStart(2, '0')}
          </option>
        ))}
      </select>
      :
      <select
        className="border rounded px-2 py-2 text-sm"
        value={minute}
        onChange={(e) => setMinute(e.target.value)}
      >
        {['00', '15', '30', '45'].map((min) => (
          <option key={min} value={min}>
            {min}
          </option>
        ))}
      </select>
    </div>
  )
}
