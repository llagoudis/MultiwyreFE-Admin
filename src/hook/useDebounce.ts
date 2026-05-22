import { useEffect } from "react";

function useDebounce(effect: () => void, depencies: any[], timeout: number) {
  let timerID: null | ReturnType<typeof setTimeout>;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    timerID = setTimeout(effect, timeout);
    return () => {
      if (timerID) clearTimeout(timerID);
    };
  }, depencies);
}

export default useDebounce;
