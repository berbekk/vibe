import { getAllItems } from './data.js?v=4';

export function computeProgress(checkedMap) {
  const items = getAllItems();
  const total = items.length;
  const done = items.filter((item) => checkedMap[item.id]).length;
  const criticalItems = items.filter((item) => item.priority === 'critical');
  const criticalDone = criticalItems.filter((item) => checkedMap[item.id]).length;

  return {
    total,
    done,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
    criticalTotal: criticalItems.length,
    criticalDone,
    remaining: total - done,
  };
}

export function computeCategoryProgress(category, checkedMap) {
  const total = category.items.length;
  const done = category.items.filter((item) => checkedMap[item.id]).length;
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}
