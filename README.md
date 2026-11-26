# PayPath

PayPath turns a payment project scenario or an uploaded brief into a requirements table and a ranked recommendation for a software development life cycle (SDLC). The Next.js app runs two analysis steps through a separately hosted inference service and saves the results in SQLite.

## Run locally

1. Install Node.js 22.3 or later in the 22.x series and run `npm ci` from the project root.
2. Set `INFERENCE_BASE_URL` in `.env.local` to the base URL of your running inference service. The service must accept JSON requests at `POST /extract` and `POST /sdlc`. Use the base URL without a trailing slash. The following value is a placeholder:

   ```dotenv
   INFERENCE_BASE_URL=https://your-inference-service.example
   ```

   The checked-in `.env.local.example` still lists an Anthropic key. The current app reads `INFERENCE_BASE_URL`.
3. Run `npm run dev` and open the [local dashboard](http://localhost:3000).

## Run an analysis

Select **New analysis**. Enter a scenario or upload a PDF, DOCX, or TXT file with at least 20 characters of extractable text. Then select **Generate requirements & recommendation**. For a first run, try one of the [sample payment scenarios](Sample_scenarios.md).

The requirements table shows ID, statement, category, priority, risk, and confidence. A numeric confidence score **below 70%** flags the requirement for human review. The same cutoff applies when reopening a saved analysis. The SDLC section identifies the first choice and alternatives, explains each ranking, and lists the recommended workflow’s phases, key controls, and approval gates.

## How the analysis works

| Step | Behavior |
| --- | --- |
| Prepare an upload | The app chunks the extracted text and embeds it locally with `Xenova/all-MiniLM-L6-v2`. The model downloads on first use. For each of seven topics, the app selects the two most similar chunks, removes duplicates, and joins the selections in document order to form the scenario. Typed scenarios go directly to extraction. |
| Extract requirements | BM25 retrieves up to three matching regulation entries from the knowledge base. The app sends the scenario and that evidence to `/extract`, then applies the confidence review cutoff to the returned requirements. |
| Recommend an SDLC | The app sends the requirements, the original analysis scenario, and **all seven SDLC rules** to `/sdlc`. The agent compares Agile, Waterfall, V-Model, Spiral, RAD, Prototype, and Iterative. The app checks that the ranking contains supported, unique model names and retries once if the ranking is invalid. |
| Save and reopen | SQLite stores the scenario, requirements, recommendation, and evidence in `data.sqlite` in the project root. The same file stores uploaded text chunks and embeddings. The dashboard lists the 50 most recent sessions. |

## Inference service contract

Both endpoints are relative to `INFERENCE_BASE_URL`. The Next.js server sends and receives JSON.

| Endpoint | Request fields | Expected response |
| --- | --- | --- |
| `POST /extract` | `scenario`, `evidence` | A `requirements` array. Each row uses `id`, `statement`, `category`, `priority`, `risk`, and numeric `confidence` on a percentage scale. |
| `POST /sdlc` | `requirements`, `compliance` (an empty array), `evidence` (includes the scenario and model guidance) | An `sdlc` object with a nonempty `ranked_options` array of `{ model, reason }` entries. The results page reads `phases`, `key_controls`, and `approval_gates` from `sdlc.recommended_workflow`. |

The [pipeline route](app/api/pipeline/route.ts) coordinates the two calls. To change the evidence or ranking instructions, see the [knowledge base](data/knowledge-base.ts) and [inference client](lib/server.ts). The [review rule](lib/requirement-review.ts) controls the confidence cutoff.
