const FakeTable = () => {
  return (
    <div>
      <table
        className="min-w-full bg-white border border-gray-300 border-collapse"
        style={{ border: '1px solid darkgray' }}
      >
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 text-left px-4 py-2">
              Heading 1
            </th>
            <th className="border border-gray-300 text-left px-4 py-2">
              Heading 2
            </th>
            <th className="border border-gray-300 text-left px-4 py-2">
              Heading 3
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Cell 1</td>
            <td className="border border-gray-300 px-4 py-2"> Cell 2</td>
            <td className="border border-gray-300 px-4 py-2">Cell 3</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Cell 4</td>
            <td className="border border-gray-300 px-4 py-2"> Cell 5</td>
            <td className="border border-gray-300 px-4 py-2">Cell 6</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default FakeTable;
