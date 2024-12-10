/**
 * egjs-grid
 * Copyright (c) 2021-present NAVER Corp.
 * MIT license
 */
import Grid from "../Grid";
import { PROPERTY_TYPE, UPDATE_STATE } from "../consts";
import { GridOptions, Properties, GridOutlines, GridAlign, MasonryGridVerticalAlign } from "../types";
import { range, GetterSetter } from "../utils";
import { GridItem } from "../GridItem";


function getColumnPoint(
  outline: number[],
  columnIndex: number,
  columnCount: number,
  pointCaculationName: "max" | "min",
) {
  return Math[pointCaculationName](...outline.slice(columnIndex, columnIndex + columnCount));
}

function getColumnIndex(
  outline: number[],
  columnCount: number,
  nearestCalculationName: "max" | "min",
  startPos: number,
) {
  const length = outline.length - columnCount + 1;
  const pointCaculationName = nearestCalculationName === "max" ? "min" : "max";
  const indexCaculationName = nearestCalculationName === "max" ? "lastIndexOf" : "indexOf";
  const points = range(length).map((index) => {
    const point = getColumnPoint(outline, index, columnCount, pointCaculationName);

    return Math[pointCaculationName](startPos, point);
  });

  return points[indexCaculationName](Math[nearestCalculationName](...points));
}

/**
 * @typedef
 * @memberof Grid.MasonryGrid
 * @extends Grid.GridOptions
 */
export interface MasonryGridOptions extends GridOptions {
  /**
   * The number of columns. If the number of columns is 0, it is automatically calculated according to the size of the container. Can be used instead of outlineLength.
   * <ko>열의 개수. 열의 개수가 0이라면, 컨테이너의 사이즈에 의해 계산이 된다. outlineLength 대신 사용할 수 있다.</ko>
   * @default 0
   */
  column?: number;
  /**
   * The size of the columns. If it is 0, it is calculated as the size of the first item in items. Can be used instead of outlineSize.
   * <ko>열의 사이즈. 만약 열의 사이즈가 0이면, 아이템들의 첫번째 아이템의 사이즈로 계산이 된다. outlineSize 대신 사용할 수 있다.</ko>
   * @default 0
   */
  columnSize?: number;
  /**
   * The size ratio(inlineSize / contentSize) of the columns. 0 is not set. `true` is automatically calculated as orgInlineSize / orgContentSize.
   * <ko>열의 사이즈 비율(inlineSize / contentSize). 0은 미설정이다. `true` 는 orgInlineSize / orgContentSize로 자동 계산이 된다.</ko>
   * @default 0
   */
  columnSizeRatio?: number | boolean;
  /**
   * Align of the position of the items. If you want to use `stretch`, be sure to set `column`, `columnSize` or `maxStretchColumnSize` option. ("start", "center", "end", "justify", "stretch")
   * <ko>아이템들의 위치의 정렬. `stretch`를 사용하고 싶다면 `column`, `columnSize` 또는 `maxStretchColumnSize` 옵션을 설정해라.  ("start", "center", "end", "justify", "stretch")</ko>
   * @default "justify"
   */
  align?: GridAlign;
  /**
   * Content direction alignment of items. “Masonry” is sorted in the form of masonry. Others are applied as content direction alignment, similar to vertical-align of inline-block.
   * If you set multiple columns (`data-grid-column`), the screen may look strange.
   * <ko>아이템들의 Content 방향의 정렬. "masonry"는 masonry 형태로 정렬이 된다. 그 외는 inline-block의 vertical-align과 유사하게 content 방향 정렬로 적용이 된다.칼럼(`data-grid-column` )을 여러개 설정하면 화면이 이상하게 보일 수 있다. </ko>
   * @default "masonry"
   */
  contentAlign?: MasonryGridVerticalAlign;
  /**
   * Difference Threshold for Counting Columns. Since offsetSize is calculated by rounding, the number of columns may not be accurate.
   * <ko>칼럼 개수를 계산하기 위한 차이 임계값. offset 사이즈는 반올림으로 게산하기 때문에 정확하지 않을 수 있다.</ko>
   * @default 1
   */
  columnCalculationThreshold?: number;
  /**
   * If stretch is used, the column can be automatically calculated by setting the maximum size of the column that can be stretched.
   * <ko>stretch를 사용한 경우 최대로 늘릴 수 있는 column의 사이즈를 설정하여 column을 자동 계산할 수 있다.</ko>
   * @default Infinity
   */
  maxStretchColumnSize?: number;

  /**
   * Adjust the contentSize of the items to make the outlines equal.
   * <ko>아이템들의 contentSize를 조절하여 outline을 동등하게 한다.</ko>
   * @default ""
   */
  stretchOutline?: "scale-down" | "scale-up" | "scale-center" | "";
}

/**
 * MasonryGrid is a grid that stacks items with the same width as a stack of bricks. Adjust the width of all images to the same size, find the lowest height column, and insert a new item.
 * @ko MasonryGrid는 벽돌을 쌓아 올린 모양처럼 동일한 너비를 가진 아이템를 쌓는 레이아웃이다. 모든 이미지의 너비를 동일한 크기로 조정하고, 가장 높이가 낮은 열을 찾아 새로운 이미지를 삽입한다. 따라서 배치된 아이템 사이에 빈 공간이 생기지는 않지만 배치된 레이아웃의 아래쪽은 울퉁불퉁해진다.
 * @memberof Grid
 * @param {HTMLElement | string} container - A base element for a module <ko>모듈을 적용할 기준 엘리먼트</ko>
 * @param {Grid.MasonryGrid.MasonryGridOptions} options - The option object of the MasonryGrid module <ko>MasonryGrid 모듈의 옵션 객체</ko>
 */
@GetterSetter
export class MasonryGrid extends Grid<MasonryGridOptions> {
  public static propertyTypes = {
    ...Grid.propertyTypes,
    column: PROPERTY_TYPE.RENDER_PROPERTY,
    columnSize: PROPERTY_TYPE.RENDER_PROPERTY,
    columnSizeRatio: PROPERTY_TYPE.RENDER_PROPERTY,
    align: PROPERTY_TYPE.RENDER_PROPERTY,
    columnCalculationThreshold: PROPERTY_TYPE.RENDER_PROPERTY,
    maxStretchColumnSize: PROPERTY_TYPE.RENDER_PROPERTY,
    contentAlign: PROPERTY_TYPE.RENDER_PROPERTY,
    stretchOutline: PROPERTY_TYPE.RENDER_PROPERTY,
  };
  public static defaultOptions: Required<MasonryGridOptions> = {
    ...Grid.defaultOptions,
    align: "justify",
    column: 0,
    columnSize: 0,
    columnSizeRatio: 0,
    columnCalculationThreshold: 0.5,
    maxStretchColumnSize: Infinity,
    contentAlign: "masonry",
    stretchOutline: "",
  };

  public applyGrid(items: GridItem[], direction: "start" | "end", outline: number[]): GridOutlines {
    items.forEach((item) => {
      item.isRestoreOrgCSSText = false;
    });
    const columnSize = this.getComputedOutlineSize(items);
    const column = this.getComputedOutlineLength(items);

    const {
      align,
      observeChildren,
      columnSizeRatio,
      contentAlign,
      stretchOutline,
    } = this.options;
    const inlineGap = this.getInlineGap();
    const contentGap = this.getContentGap();
    const outlineLength = outline.length;
    const itemsLength = items.length;
    const alignPoses = this._getAlignPoses(column, columnSize);
    const isEndDirection = direction === "end";
    const nearestCalculationName = isEndDirection ? "min" : "max";
    const pointCalculationName = isEndDirection ? "max" : "min";

    let startOutline = [0];

    if (outlineLength === column) {
      startOutline = outline.slice();
    } else {
      const point = outlineLength ? Math[pointCalculationName](...outline) : 0;

      startOutline = range(column).map(() => point);
    }
    let endOutline = startOutline.slice();
    const columnDist = column > 1 ? alignPoses[1] - alignPoses[0] : 0;
    const isStretch = align === "stretch";
    const isStartContentAlign = isEndDirection && contentAlign === "start";
    const itemIndexes: number[][] = range(startOutline.length).map(() => []);



    let startPos = isEndDirection ? -Infinity : Infinity;


    if (isStartContentAlign) {
      // support only end direction
      startPos = Math.min(...endOutline);
    }

    for (let i = 0; i < itemsLength; ++i) {
      const itemIndex = isEndDirection ? i : itemsLength - 1 - i;
      const item = items[itemIndex];
      const columnAttribute = parseInt(item.attributes.column || "1", 10);
      const maxColumnAttribute = parseInt(item.attributes.maxColumn || "1", 10);
      let contentSize = item.contentSize;
      let columnCount = Math.min(
        column,
        columnAttribute || Math.max(1, Math.ceil((item.inlineSize + inlineGap) / columnDist)),
      );
      const maxColumnCount = Math.min(column, Math.max(columnCount, maxColumnAttribute));
      let columnIndex = getColumnIndex(endOutline, columnCount, nearestCalculationName, startPos);
      let contentPos = getColumnPoint(endOutline, columnIndex, columnCount, pointCalculationName);

      if (isStartContentAlign && startPos !== contentPos) {
        startPos = Math.max(...endOutline);
        endOutline = endOutline.map(() => startPos);
        contentPos = startPos;
        columnIndex = 0;
      }

      while (columnCount < maxColumnCount) {
        const nextEndColumnIndex = columnIndex + columnCount;
        const nextColumnIndex = columnIndex - 1;

        if (isEndDirection && (nextEndColumnIndex >= column || endOutline[nextEndColumnIndex] > contentPos)) {
          break;
        }
        if (!isEndDirection && (nextColumnIndex < 0 || endOutline[nextColumnIndex] < contentPos)) {
          break;
        }
        if (!isEndDirection) {
          --columnIndex;
        }
        ++columnCount;
      }

      columnIndex = Math.max(0, columnIndex);
      columnCount = Math.min(column - columnIndex, columnCount);

      itemIndexes[columnIndex].push(itemIndex);

      // stretch mode or data-grid-column > "1"
      if ((columnAttribute > 0 && columnCount > 1) || isStretch) {
        const nextInlineSize = (columnCount - 1) * columnDist + columnSize;

        if ((!this._isObserverEnabled() || !observeChildren) && item.cssInlineSize !== nextInlineSize) {
          item.shouldReupdate = true;
        }
        item.cssInlineSize = nextInlineSize;
      }
      if (columnSizeRatio === true) {
        const ratio = item.orgContentSize / item.orgInlineSize;

        contentSize = item.computedInlineSize * ratio;
        item.cssContentSize = contentSize;
      } else if (columnSizeRatio && columnSizeRatio > 0) {
        contentSize = item.computedInlineSize / columnSizeRatio;
        item.cssContentSize = contentSize;
      }
      const inlinePos = alignPoses[columnIndex];
      contentPos = isEndDirection ? contentPos : contentPos - contentGap - contentSize;

      item.cssInlinePos = inlinePos;
      item.cssContentPos = contentPos;
      const nextOutlinePoint = isEndDirection ? contentPos + contentSize + contentGap : contentPos;

      range(columnCount).forEach((indexOffset) => {
        endOutline[columnIndex + indexOffset] = nextOutlinePoint;
      });
    }

    if (stretchOutline && items.length) {
      let scalePoint = 0;

      if (stretchOutline === "scale-up") {
        scalePoint = Math.max(...endOutline);
      } else if (stretchOutline === "scale-center") {
        scalePoint = (Math.max(...endOutline) + Math.min(...endOutline)) / 2;
      } else {
        // scale-down
        scalePoint = Math.min(...endOutline);
      }
      if (isEndDirection) {
        scalePoint -= contentGap;
      }

      endOutline.forEach((point, i) => {
        const totalGap = (itemIndexes[i].length - 1) * contentGap;
        const startPoint = startOutline[i];
        const scale = (Math.abs(scalePoint - startPoint) - totalGap)
          / (Math.abs(point - startPoint) - (isEndDirection ? contentGap : 0) - totalGap);

        if (scale === 1 || !isFinite(scale)) {
          return;
        }
        if (isEndDirection) {
          endOutline[i] = scalePoint + contentGap;
        } else {
          endOutline[i] = scalePoint;
        }

        const length = itemIndexes[i].length;
        let prevPoint = isEndDirection ? startOutline[i]: startOutline[i] - contentGap;

        itemIndexes[i].forEach((itemIndex, j) => {
          const item = items[itemIndex];
          const prevSize = item.computedContentSize;
          const nextSize = prevSize * scale;


          item.addCSSGridRect({
            contentPos: isEndDirection ? prevPoint : prevPoint - nextSize,
            contentSize: nextSize,
          });

          if (isEndDirection) {
            prevPoint = item.cssContentPos! + item.cssContentSize! + contentGap;
          } else {
            prevPoint = item.cssContentPos! - contentGap;
          }

          if (j === length - 1) {
            let posOffset = 0;
            let sizeOffset = 0;

            if (isEndDirection) {
              sizeOffset = (item.cssContentPos! % 1 >= 0.5 ? 1 : 0)
                + (item.cssContentSize! % 1 >= 0.5 ? 1 : 0)
                + (scalePoint % 1 >= 0.5 ? -1 : 0);
            } else {
              posOffset = (item.cssContentPos! % 1 < 0.5 ? -1 : 0)
                + (scalePoint % 1 < 0.5 ? 1 : 0);
            }
            // Offset position and size need to be adjusted because they are rounded.


            item.addCSSGridRect({
              contentPos: item.cssContentPos! - posOffset,
              contentSize: item.cssContentSize! - sizeOffset,
            });
          }
        });
      });
    }
    // Finally, check whether startPos and min of the outline match.
    // If different, endOutline is updated.
    if (isStartContentAlign && startPos !== Math.min(...endOutline)) {
      startPos = Math.max(...endOutline);
      endOutline = endOutline.map(() => startPos);
    }

    // if end items, startOutline is low, endOutline is high
    // if start items, startOutline is high, endOutline is low
    return {
      start: isEndDirection ? startOutline : endOutline,
      end: isEndDirection ? endOutline : startOutline,
    };
  }
  public getComputedOutlineSize(items = this.items) {
    const { align } = this.options;
    const inlineGap = this.getInlineGap();
    const containerInlineSize = this.getContainerInlineSize();
    const columnSizeOption = this.columnSize || this.outlineSize;
    const columnOption = this.column || this.outlineLength;
    let column = columnOption || 1;

    let columnSize = 0;

    if (align === "stretch") {
      if (!columnOption) {
        const maxStretchColumnSize = this.maxStretchColumnSize || Infinity;

        column = Math.max(1, Math.ceil((containerInlineSize + inlineGap) / (maxStretchColumnSize + inlineGap)));
      }
      columnSize = (containerInlineSize + inlineGap) / (column || 1) - inlineGap;
    } else if (columnSizeOption) {
      columnSize = columnSizeOption;
    } else if (items.length) {
      let checkedItem = items[0];

      for (const item of items) {
        const attributes = item.attributes;
        const columnAttribute = parseInt(attributes.column || "1", 10);
        const maxColumnAttribute = parseInt(attributes.maxColumn || "1", 10);

        if (
          item.updateState !== UPDATE_STATE.UPDATED
          || !item.inlineSize
          || columnAttribute !== 1
          || maxColumnAttribute !== 1
        ) {
          continue;
        }
        checkedItem = item;
        break;
      }
      const inlineSize = checkedItem.inlineSize || 0;

      columnSize = inlineSize;
    } else {
      columnSize = containerInlineSize;
    }
    return columnSize || 0;
  }
  public getComputedOutlineLength(items = this.items) {
    const inlineGap = this.getInlineGap();
    const columnOption = this.column || this.outlineLength;
    const columnCalculationThreshold = this.columnCalculationThreshold;
    let column = 1;

    if (columnOption) {
      column = columnOption;
    } else {
      const columnSize = this.getComputedOutlineSize(items);

      column = Math.max(
        1,
        Math.floor(
          (this.getContainerInlineSize() + inlineGap) /
          (columnSize - columnCalculationThreshold + inlineGap)
        )
      );
      if (!this.maxStretchColumnSize) {
        column = Math.min(
          items.length,
          column,
        );
      }
    }
    return column;
  }
  private _getAlignPoses(column: number, columnSize: number) {
    const { align } = this.options;
    const inlineGap = this.getInlineGap();
    const containerSize = this.getContainerInlineSize();
    const indexes = range(column);

    let offset = 0;
    let dist = 0;

    if (align === "justify" || align === "stretch") {
      const countDist = column - 1;

      dist = countDist ? Math.max((containerSize - columnSize) / countDist, columnSize + inlineGap) : 0;
      offset = Math.min(0, containerSize / 2 - (countDist * dist + columnSize) / 2);
    } else {
      dist = columnSize + inlineGap;
      const totalColumnSize = (column - 1) * dist + columnSize;

      if (align === "center") {
        offset = (containerSize - totalColumnSize) / 2;
      } else if (align === "end") {
        offset = containerSize - totalColumnSize;
      }
    }
    return indexes.map((i) => {
      return offset + i * dist;
    });
  }
}

export interface MasonryGrid extends Properties<typeof MasonryGrid> {
}


/**
 * Align of the position of the items. If you want to use `stretch`, be sure to set `column` or `columnSize` option. ("start", "center", "end", "justify", "stretch")
 * @ko 아이템들의 위치의 정렬. `stretch`를 사용하고 싶다면 `column` 또는 `columnSize` 옵션을 설정해라.  ("start", "center", "end", "justify", "stretch")
 * @name Grid.MasonryGrid#align
 * @type {$ts:Grid.MasonryGrid.MasonryGridOptions["align"]}
 * @default "justify"
 * @example
 * ```js
 * import { MasonryGrid } from "@egjs/grid";
 *
 * const grid = new MasonryGrid(container, {
 *   align: "start",
 * });
 *
 * grid.align = "justify";
 * ```
 */


/**
 * The number of columns. If the number of columns is 0, it is automatically calculated according to the size of the container.  Can be used instead of outlineLength.
 * @ko 열의 개수. 열의 개수가 0이라면, 컨테이너의 사이즈에 의해 계산이 된다. outlineLength 대신 사용할 수 있다.
 * @name Grid.MasonryGrid#column
 * @type {$ts:Grid.MasonryGrid.MasonryGridOptions["column"]}
 * @default 0
 * @example
 * ```js
 * import { MasonryGrid } from "@egjs/grid";
 *
 * const grid = new MasonryGrid(container, {
 *   column: 0,
 * });
 *
 * grid.column = 4;
 * ```
 */


/**
 * The size of the columns. If it is 0, it is calculated as the size of the first item in items. Can be used instead of outlineSize.
 * @ko 열의 사이즈. 만약 열의 사이즈가 0이면, 아이템들의 첫번째 아이템의 사이즈로 계산이 된다. outlineSize 대신 사용할 수 있다.
 * @name Grid.MasonryGrid#columnSize
 * @type {$ts:Grid.MasonryGrid.MasonryGridOptions["columnSize"]}
 * @default 0
 * @example
 * ```js
 * import { MasonryGrid } from "@egjs/grid";
 *
 * const grid = new MasonryGrid(container, {
 *   columnSize: 0,
 * });
 *
 * grid.columnSize = 200;
 * ```
 */


/**
 * The size ratio(inlineSize / contentSize) of the columns. 0 is not set.
 * @ko 열의 사이즈 비율(inlineSize / contentSize). 0은 미설정이다.
 * @name Grid.MasonryGrid#columnSizeRatio
 * @type {$ts:Grid.MasonryGrid.MasonryGridOptions["columnSizeRatio"]}
 * @default 0
 * @example
 * ```js
 * import { MasonryGrid } from "@egjs/grid";
 *
 * const grid = new MasonryGrid(container, {
 *   columnSizeRatio: 0,
 * });
 *
 * grid.columnSizeRatio = 0.5;
 * ```
 */


/**
 * If stretch is used, the column can be automatically calculated by setting the maximum size of the column that can be stretched.
 * @ko stretch를 사용한 경우 최대로 늘릴 수 있는 column의 사이즈를 설정하여 column을 자동 계산할 수 있다.
 * @name Grid.MasonryGrid#maxStretchColumnSize
 * @type {$ts:Grid.MasonryGrid.MasonryGridOptions["maxStretchColumnSize"]}
 * @default Infinity
 * @example
 * ```js
 * import { MasonryGrid } from "@egjs/grid";
 *
 * const grid = new MasonryGrid(container, {
 *   align: "stretch",
 *   maxStretchColumnSize: 0,
 * });
 *
 * grid.maxStretchColumnSize = 400;
 * ```
 */
