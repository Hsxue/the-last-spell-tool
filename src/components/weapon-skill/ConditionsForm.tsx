export function ConditionsForm() {
  return (
    <div className="p-4 space-y-3 border-t">
      <h3 className="text-sm font-semibold">Conditions</h3>
      <div><label className="text-xs">Phase</label><input type="text" className="w-full border rounded px-2 py-1 text-xs" defaultValue="Combat" /></div>
      <p className="text-xs text-gray-400">Task 17 - Conditions placeholder</p>
    </div>
  );
}