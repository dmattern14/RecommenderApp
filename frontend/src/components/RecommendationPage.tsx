import { useEffect, useState } from "react";
import Papa from "papaparse";

interface RecommendationRow {
  [key: string]: string;
}

function RecommendationPage() {
  const [collabContentId, setCollabContentId] = useState("");
  const [contentContentId, setContentContentId] = useState("");
  const [userId, setUserId] = useState(""); // Changed from azureContentId to userId
  const [collabIds, setCollabIds] = useState<string[]>([]);
  const [contentIds, setContentIds] = useState<string[]>([]);
  const [azureIds, setAzureIds] = useState<string[]>([]);
  const [collabRecs, setCollabRecs] = useState<string[]>([]);
  const [contentRecs, setContentRecs] = useState<string[]>([]);
  const [azureRecs, setAzureRecs] = useState<string[]>([]);

  useEffect(() => {
    const loadIds = async (
      file: string,
      setter: (ids: string[]) => void,
      idKey: string
    ) => {
      const res = await fetch(file);
      const csvText = await res.text();
      Papa.parse(csvText, {
        header: true,
        complete: (result) => {
          const rows = result.data as RecommendationRow[];
          const ids = rows
            .map((r) => r[idKey])
            .filter(
              (id): id is string => typeof id === "string" && id.trim() !== ""
            );
          setter(ids);
        },
      });
    };

    loadIds("/collaborative.csv", setCollabIds, "content_id");
    loadIds("/content.csv", setContentIds, "contentId");
    loadIds("/content.csv", setAzureIds, "contentId");
  }, []);

  useEffect(() => {
    if (!collabContentId) return;

    fetch("/collaborative.csv")
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          complete: (result) => {
            const rows = result.data as RecommendationRow[];
            const match = rows.find((r) => r.content_id === collabContentId);
            if (match) {
              const recs = [
                match["Recommendation 1"],
                match["Recommendation 2"],
                match["Recommendation 3"],
                match["Recommendation 4"],
                match["Recommendation 5"],
              ];
              setCollabRecs(recs);
            }
          },
        });
      });
  }, [collabContentId]);

  useEffect(() => {
    if (!contentContentId) return;

    fetch("/content.csv")
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          complete: (result) => {
            const rows = result.data as RecommendationRow[];
            const match = rows.find((r) => r.contentId === contentContentId);
            if (match) {
              const raw = match["recommended_contentIds"] || "";
              const matches = [...raw.matchAll(/np\.int64\((-?\d+)\)/g)];
              const cleaned = matches.map((m) => m[1]);
              setContentRecs(cleaned);
            }
          },
        });
      });
  }, [contentContentId]);

  useEffect(() => {
    if (!userId) return; // Now based on userId

    const fetchAzureRecs = async () => {
      try {
        const response = await fetch(
          "http://09d9f527-9111-461a-827e-c43241612b1b.eastus2.azurecontainer.io/score",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer 3pYon0bqisPmtNOhSA2nMXFMMNrFxg3C",
            },
            body: JSON.stringify({
              input_data: [
                {
                  data: [
                    {
                      user_id: userId, // Sending userId in the request
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (!response.ok) {
          console.error("❌ Azure error:", response.status);
          setAzureRecs(["Error: Unable to fetch Azure recommendations"]);
          return;
        }

        const data = await response.json();
        console.log(
          "✅ Azure FULL RAW RESPONSE:",
          JSON.stringify(data, null, 2)
        );

        // Assuming the response contains a list of recommendations
        const azureRecommendations = data?.recommendations || [
          "No recommendations available",
        ];
        setAzureRecs(azureRecommendations);
      } catch (err) {
        console.error("🔥 Azure fetch failed:", err);
        setAzureRecs(["Error: Unable to fetch Azure recommendations"]);
      }
    };

    fetchAzureRecs();
  }, [userId]); // Trigger when userId changes

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h2>Select Content IDs</h2>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: "bold" }}>Collaborative Content ID: </label>
        <select
          value={collabContentId}
          onChange={(e) => setCollabContentId(e.target.value)}
          style={{ padding: "10px", fontSize: "16px", margin: "0 10px" }}
        >
          <option value="">-- Select --</option>
          {collabIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: "bold" }}>Content-Based Content ID: </label>
        <select
          value={contentContentId}
          onChange={(e) => setContentContentId(e.target.value)}
          style={{ padding: "10px", fontSize: "16px", margin: "0 10px" }}
        >
          <option value="">-- Select --</option>
          {contentIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "40px" }}>
        <label style={{ fontWeight: "bold" }}>Azure User ID: </label>
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)} // Changed from azureContentId to userId
          style={{ padding: "10px", fontSize: "16px", margin: "0 10px" }}
        >
          <option value="">-- Select --</option>
          {azureIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </div>

      {(collabContentId || contentContentId || userId) && (
        <>
          <h3>Recommendations</h3>
          <table
            style={{
              margin: "0 auto",
              borderCollapse: "collapse",
              width: "90%",
            }}
          >
            <thead>
              <tr>
                <th></th>
                {[...Array(5)].map((_, i) => (
                  <th
                    key={i}
                    style={{ border: "1px solid gray", padding: "10px" }}
                  >
                    Article {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {collabContentId && (
                <tr>
                  <td style={{ fontWeight: "bold", padding: "10px" }}>
                    Collaborative
                  </td>
                  {collabRecs.map((rec, i) => (
                    <td
                      key={i}
                      style={{ border: "1px solid gray", padding: "10px" }}
                    >
                      {rec}
                    </td>
                  ))}
                </tr>
              )}
              {contentContentId && (
                <tr>
                  <td style={{ fontWeight: "bold", padding: "10px" }}>
                    Content-Based
                  </td>
                  {contentRecs.map((rec, i) => (
                    <td
                      key={i}
                      style={{ border: "1px solid gray", padding: "10px" }}
                    >
                      {rec}
                    </td>
                  ))}
                </tr>
              )}
              {userId && (
                <tr>
                  <td style={{ fontWeight: "bold", padding: "10px" }}>Azure</td>
                  {azureRecs.map((rec, i) => (
                    <td
                      key={i}
                      style={{ border: "1px solid gray", padding: "10px" }}
                    >
                      {rec}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default RecommendationPage;
