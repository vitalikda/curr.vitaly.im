export const Drawer = ({
  open,
  onClose,
  children
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}) => {
  return (
    <div className={`${open ? '' : 'sr-only'}`}>
      <div
        className={`fixed inset-0 z-30 transition-opacity bg-black bg-opacity-50 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 w-full max-w-lg p-4 mx-auto overflow-y-auto transition-transform h-[65vh] bg-slate-800 transform-none ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {children}
      </div>
    </div>
  )
}
