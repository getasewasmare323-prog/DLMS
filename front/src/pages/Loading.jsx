import React from "react";
import { Loader2Icon, Loader, Loader2 } from "lucide-react";
function Loading() {
  return (
    <div className="min-h-screen bg-slate-800 opacity-25 w-full ">
      <Loader className="animate-spin size-9 fill-slate-950 mx-auto my-auto" />
    </div>
  );
}

export default Loading;
