"use client";

export function IncomingCallScreen({ caller, onAccept, onReject }: { caller: string; onAccept: () => void; onReject: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080214]/90">
      <div className="w-[90%] max-w-sm rounded-3xl border border-purple-300/40 bg-[#1a0a33]/70 p-6 text-center backdrop-blur-xl">
        <p className="text-sm text-purple-200">Incoming call</p>
        <h2 className="mt-1 text-2xl font-semibold text-white">{caller}</h2>
        <div className="mt-5 flex gap-3">
          <button onClick={onReject} className="flex-1 rounded-full bg-red-500 px-4 py-2 text-white">Decline</button>
          <button onClick={onAccept} className="flex-1 rounded-full bg-green-500 px-4 py-2 text-white">Accept</button>
        </div>
      </div>
    </div>
  );
}
