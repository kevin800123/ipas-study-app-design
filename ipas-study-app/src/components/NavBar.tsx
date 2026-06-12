import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: '首頁' },
  { to: '/wrong', label: '錯題本' },
  { to: '/info', label: '考試資訊' },
]

export function NavBar() {
  return (
    <nav className="fixed bottom-0 inset-x-0 border-t bg-white flex md:static md:border-t-0 md:border-r md:flex-col md:w-48">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.to === '/'}
          className={({ isActive }) =>
            `flex-1 text-center py-3 text-sm ${isActive ? 'text-sky-700 font-medium' : 'text-gray-500'}`
          }
        >
          {it.label}
        </NavLink>
      ))}
    </nav>
  )
}
