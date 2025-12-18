// ✅ Avec <dialog>

import { useRef } from "react";

export const SomeComponentWithNativeDialog = () => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  return (
    <>
      <dialog ref={dialogRef}>
        <form method="dialog">{/* Contenu du dialog */}</form>
      </dialog>

      <button onClick={() => dialogRef.current?.showModal()}>Ouvrir</button>

      <button onClick={() => dialogRef.current?.close()}>Fermer</button>
    </>
  );
};
