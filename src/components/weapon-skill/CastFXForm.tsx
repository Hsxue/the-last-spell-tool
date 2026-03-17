export function CastFXForm() {
  return (
    <div className="p-4 space-y-3 border-t">
      <h3 className="text-sm font-semibold">Cast Effects</h3>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs">VFX</label><input type="text" className="w-full border rounded px-2 py-1 text-xs" defaultValue="" /></div>
        <div><label className="text-xs">Sound</label><input type="text" className="w-full border rounded px-2 py-1 text-xs" defaultValue="" /></div>
        <div><label className="text-xs">Cam Shake</label><input type="number" step="0.1" className="w-full border rounded px-2 py-1 text-xs" defaultValue={0} /></div>
        <div><label className="text-xs">Caster Anim</label><input type="text" className="w-full border rounded px-2 py-1 text-xs" defaultValue="" /></div>
      </div>
      <p className="text-xs text-gray-400">Task 18 - CastFX placeholder</p>
    </div>
  );
}