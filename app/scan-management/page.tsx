"use client";

import MainLayout from "@/components/layout/MainLayout";

const activeScans = [
  {
    title: "External Perimeter Audit",
    id: "SCAN-77291-B",
    progress: 65,
    status: "IN PROGRESS",
  },
  {
    title: "Internal Database Cluster",
    id: "SCAN-88310-X",
    progress: 92,
    status: "FINALIZING",
  },
];

const history = [
  {
    status: "Success",
    url: "api.sentinel-core.io",
    duration: "12m 45s",
  },
  {
    status: "Failed",
    url: "staging-env-04.cloud",
    duration: "02m 10s",
  },
  {
    status: "Success",
    url: "vault.production-internal.net",
    duration: "45m 12s",
  },
  {
    status: "Success",
    url: "legacy-gateway.corp",
    duration: "08m 22s",
  },
];

export default function ScanManagementPage() {
  return (
    <MainLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Scan Management
          </h1>

          <span className="text-sm px-3 py-1 rounded-md bg-green-500/20 text-green-400">
            ● System Optimal
          </span>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "TOTAL SCANS TODAY", value: "142", extra: "+12%" },
            { label: "AVG SCAN TIME", value: "18.4 min" },
            { label: "QUEUED SCANS", value: "03/10" },
          ].map((item, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-white/10"
              style={{ backgroundColor: "var(--color-secondary)" }}
            >
              <p className="text-gray-400 text-xs">{item.label}</p>
              <h2 className="text-2xl font-bold text-white mt-1">
                {item.value}
              </h2>
              {item.extra && (
                <span className="text-green-400 text-xs">
                  {item.extra}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* ACTIVE SCANS */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Active Scans
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {activeScans.map((scan, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-white/10"
                style={{ backgroundColor: "var(--color-secondary)" }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-semibold">
                      {scan.title}
                    </h3>
                    <p className="text-xs text-gray-400">
                      ID: {scan.id}
                    </p>
                  </div>

                  <span
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: "rgba(56,189,248,0.1)",
                      color: "var(--color-primary)",
                    }}
                  >
                    {scan.status}
                  </span>
                </div>

                {/* PROGRESS */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{scan.progress}%</span>
                  </div>

                  <div className="w-full h-2 bg-gray-700 rounded">
                    <div
                      className="h-2 rounded"
                      style={{
                        width: `${scan.progress}%`,
                        backgroundColor: "var(--color-primary)",
                      }}
                    />
                  </div>
                </div>

                <button className="mt-3 text-red-400 text-xs hover:underline">
                  ✖ Cancel
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* HISTORY */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Recent History
          </h2>

          <div
            className="rounded-xl border border-white/10 overflow-hidden"
            style={{ backgroundColor: "var(--color-secondary)" }}
          >
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-gray-400 text-xs uppercase border-b border-white/10">
                <tr>
                  <th className="p-4">Status</th>
                  <th>Target</th>
                  <th>Duration</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {history.map((item, i) => (
                  <tr
                    key={i}
                    className="border-t border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="p-4">
                      {item.status === "Success" ? (
                        <span className="text-green-400 font-medium">
                          Success
                        </span>
                      ) : (
                        <span className="text-red-400 font-medium">
                          Failed
                        </span>
                      )}
                    </td>

                    <td className="text-gray-400">{item.url}</td>
                    <td>{item.duration}</td>

                    <td>
                      <button
                        className="px-3 py-1 text-xs rounded transition"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.05)",
                        }}
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}