export function AreaOfEffectForm() {
  return (
    <div className="p-4 space-y-3 border-t">
      <h3 className="text-sm font-semibold">Area of Effect</h3>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs">Origin X</label><input type="number" className="w-full border rounded px-2 py-1 text-xs" defaultValue={0} /></div>
        <div><label className="text-xs">Origin Y</label><input type="number" className="w-full border rounded px-2 py-1 text-xs" defaultValue={0} /></div>
      </div>
      <div><label className="text-xs">Pattern</label><textarea className="w-full border rounded px-2 py-1 text-xs" rows={3} placeholder="ASCII grid pattern" /></div>
      <p className="text-xs text-gray-400">Task 15 - AoE placeholder</p>
    </div>
  );
}