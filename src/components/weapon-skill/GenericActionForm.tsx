export function GenericActionForm() {
  return (
    <div className="p-4 space-y-3 border-t">
      <h3 className="text-sm font-semibold">Generic Action</h3>
      <div className="space-y-2">
        <div><label className="text-xs">Action Type</label><input type="text" className="w-full border rounded px-2 py-1 text-xs" defaultValue="" /></div>
        <div><label className="text-xs">Parameters</label><textarea className="w-full border rounded px-2 py-1 text-xs" rows={3} placeholder="key=value pairs" /></div>
      </div>
      <p className="text-xs text-gray-400">Task 17 - GenericActionForm placeholder</p>
    </div>
  );
}