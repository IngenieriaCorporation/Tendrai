const MAP = {
  uploaded:   'bg-gray-100 text-gray-700',
  analyzing:  'bg-yellow-100 text-yellow-800',
  analyzed:   'bg-blue-100 text-blue-800',
  generating: 'bg-purple-100 text-purple-800',
  completed:  'bg-green-100 text-green-800',
  pending:    'bg-yellow-100 text-yellow-800',
  success:    'bg-green-100 text-green-800',
  failed:     'bg-red-100 text-red-700',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${MAP[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}
