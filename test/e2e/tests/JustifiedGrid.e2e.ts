
import { JustifiedGrid } from "../../../src";
import { CFCScenario } from "./utils";

Feature('Test JustifiedGrid');

const storyId = "examples-justifiedgrid--justified-grid-template";

const {
  add,
  execute,
} = CFCScenario<typeof JustifiedGrid>(storyId, {
  gap: 5,
  columnRange: [1, 8],
  rowRange: 0,
  sizeRange: [0, 1000],
});

add("JustifiedGrid Initialization", async ({ seeVisualDiffWithScreenshot }) => {
  seeVisualDiffWithScreenshot("justifiedgrid-default.png");
});

[[4, 4], [1, 4], [3, 8]].forEach((columnRange) => {
  add(`test columnRange: ${columnRange}`, async ({ seeVisualDiffWithScreenshot, updateArgs }) => {
    await updateArgs({ columnRange });
    seeVisualDiffWithScreenshot(`justifiedgrid-columnRange-${columnRange.join("_")}.png`);
  });
});
([0, [1, 4], [4, 4]] as const).forEach((rowRange) => {
  add(`test rowRange: ${rowRange}`, async ({ seeVisualDiffWithScreenshot, updateArgs }) => {
    await updateArgs({ rowRange });
    seeVisualDiffWithScreenshot(`justifiedgrid-rowRange-${rowRange ? rowRange.join("_") : "none"}.png`);
  });
});
[[0, 1000], [600, 800], [700, 1000]].forEach((sizeRange) => {
  add(`test sizeRange: ${sizeRange}`, async ({ seeVisualDiffWithScreenshot, updateArgs }) => {
    await updateArgs({ sizeRange });
    seeVisualDiffWithScreenshot(`justifiedgrid-sizeRange-${sizeRange.join("_")}.png`);
  });
});

execute();