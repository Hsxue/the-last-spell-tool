export function AttackActionForm() {
  return (
    <div className="p-4 space-y-3 border-t">
      <h3 className="text-sm font-semibold">Attack Action</h3>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs">Type</label><input type="text" className="w-full border rounded px-2 py-1 text-xs" defaultValue="Physical" /></div>
        <div><label className="text-xs">Damage Multiplier</label><input type="number" step="0.1" className="w-full border rounded px-2 py-1 text-xs" defaultValue={1.0} /></div>
        <div><label className="text-xs">Crit Chance %</label><input type="number" className="w-full border rounded px-2 py-1 text-xs" defaultValue={10} /></div>
      </div>
      <p className="text-xs text-gray-400">Task 16 - Attack placeholder</p>
    </div>
  );
}