import { Fragment, useEffect, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'

export interface ProjectItem {
  id: string
  name: string
  color: string // e.g. '#3B82F6'
}

interface ProjectSelectProps {
  projectList: ProjectItem[]
  value?: ProjectItem | undefined
  onChange: (project: ProjectItem) => void
  className?: string
  buttonClassName?: string
}

export default function ProjectSelect({
  projectList,
  value = undefined,
  onChange,
  className = '',
  buttonClassName = ''
}: ProjectSelectProps) {
  const [selected, setSelected] = useState<ProjectItem | undefined>(value)

  // 預設選第一個項目，且同步外部 value
  useEffect(() => {
    if (value) {
      setSelected(value)
    } else if (!selected && projectList && projectList.length > 0) {
      setSelected(projectList[0])
      onChange(projectList[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, projectList])

  const handleChange = (item: ProjectItem) => {
    setSelected(item)
    onChange(item)
  }

  const ColorDot = ({ color }: { color: string }) => (
    <span
      aria-hidden
      className="inline-block h-3 w-3 rounded-full border border-black/5"
      style={{ backgroundColor: color }}
    />
  )

  return (
    <div className={className}>
      <Listbox value={selected} onChange={handleChange}>
        <div className="relative">
          <Listbox.Button
            className={
              `relative w-full cursor-pointer rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${buttonClassName}`
            }
          >
            <span className="flex items-center gap-2 truncate">
              {selected && <ColorDot color={selected.color} />}
              <span className="block truncate text-gray-800">
                {selected ? selected.name : (projectList[0]?.name ?? '—')}
              </span>
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" clipRule="evenodd" />
              </svg>
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 text-base shadow-lg focus:outline-none sm:text-sm">
              {projectList.map((item) => (
                <Listbox.Option
                  key={item.id}
                  className={({ active }) =>
                    `relative cursor-pointer select-none px-3 py-2 ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-800'}`
                  }
                  value={item}
                >
                  {({ selected: isSelected }) => (
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 truncate">
                        <ColorDot color={item.color} />
                        <span className={`truncate ${isSelected ? 'font-semibold' : ''}`}>{item.name}</span>
                      </span>
                      {isSelected && (
                        <svg className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.42 0l-3.25-3.25a1 1 0 111.42-1.42l2.54 2.54 6.54-6.54a1 1 0 011.42 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
}





