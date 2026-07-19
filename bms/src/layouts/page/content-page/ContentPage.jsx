import ChatWidget from "../../../components/chat/ChatWdget";

export default function ContentPage({ title, children }) {
  return (
    <main className="flex-1 min-h-0 pl-3 pr-4 sm:pl-4 sm:pr-6 mt-2 mb-2 lg:mt-4 lg:mb-4 h-[calc(100%-1rem)] lg:h-[calc(100%-2rem)] overflow-y-auto">
      <div className="flex flex-col h-full bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden">
        <header className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
          <h1 className="text-sm font-semibold text-gray-600 dark:text-slate-300">
            {title}
          </h1>
        </header>
        <div className="flex-1 p-4 overflow-y-auto">{children}</div>
      </div>

      <ChatWidget />
    </main>
  );
}