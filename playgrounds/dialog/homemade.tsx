// ❌ Sans <dialog>

import { useState } from "react";

export const SomeComponentWithH = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {isModalOpen && (
        <>
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              zIndex: 1000,
            }}
          >
            <form>{/* Contenu du dialog */}</form>
          </div>
        </>
      )}

      <button onClick={() => setIsModalOpen(true)}>Ouvrir</button>

      <button onClick={() => setIsModalOpen(false)}>Fermer</button>
    </>
  );
};
