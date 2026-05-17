import { describe, expect, it } from "vitest";
import { interpretSearchLocally } from "./search-interpreter";

describe("search interpreter", () => {
  it("uses eaAreaName for flood warning area queries", () => {
    expect(interpretSearchLocally("show severe alerts in Yorkshire")).toMatchObject({
      resource: "flood-warnings",
      params: {
        "min-severity": "1",
        eaAreaName: "Yorkshire",
      },
    });
  });

  it("uses county for explicit county flood warning queries", () => {
    expect(interpretSearchLocally("show normal alerts in Somerset")).toMatchObject({
      resource: "flood-warnings",
      params: {
        "min-severity": "3",
        county: "Somerset",
      },
    });
  });
});
