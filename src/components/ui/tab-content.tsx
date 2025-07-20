export default function TabContent({
    data,
    emptyMsg,
  }: {
    data: { id: number; title: string; date: string; content: string }[];
    emptyMsg: string;
  }) {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center w-full h-16 text-gray-400 text-sm">
          {emptyMsg}
        </div>
      );
    }
    return (
      <ul className="w-full px-4">
        {data.map((item) => (
          <li key={item.id} className="py-1 border-b border-gray-100 last:border-b-0">
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-gray-800 truncate">{item.title}</span>
              <span className="text-[11px] text-gray-400">{item.date}</span>
              <span className="text-[12px] text-gray-500 truncate">{item.content}</span>
            </div>
          </li>
        ))}
      </ul>
    );
  }