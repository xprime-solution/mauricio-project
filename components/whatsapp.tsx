import { STORE } from "./brand";

export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent("Olá! Vim pelo site da DTF4U e quero tirar uma dúvida.")}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar com a DTF4U no WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-[#25d366] text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,0.6)] transition hover:scale-105"
    >
      <svg viewBox="0 0 32 32" className="size-7" fill="currentColor" aria-hidden>
        <path d="M16.04 3C9.4 3 4 8.37 4 15c0 2.34.68 4.6 1.95 6.54L4 29l7.66-1.98A12.07 12.07 0 0 0 16.04 27C22.67 27 28 21.63 28 15S22.67 3 16.04 3Zm0 21.8c-1.8 0-3.56-.48-5.1-1.4l-.37-.22-4.54 1.17 1.21-4.42-.24-.38A9.75 9.75 0 0 1 6.2 15c0-5.42 4.42-9.82 9.84-9.82 5.42 0 9.8 4.4 9.8 9.82 0 5.41-4.38 9.8-9.8 9.8Zm5.4-7.35c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.48.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.08 1.75-.71 2-1.4.25-.69.25-1.28.17-1.4-.07-.13-.27-.2-.57-.35Z" />
      </svg>
    </a>
  );
}
