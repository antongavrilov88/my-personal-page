export type Demo = {
  slug: string;
  title: { en: string; ru: string };
  summary: { en: string; ru: string };
  writeup: { en: string[]; ru: string[] };
};

export const demos: Demo[] = [
  {
    slug: 'sorting-race',
    title: {
      en: 'Sorting race',
      ru: 'Гонка сортировок',
    },
    summary: {
      en: 'Five classic sorting algorithms racing on the same shuffled array — watch O(n²) lose to O(n log n) in real time.',
      ru: 'Пять классических сортировок соревнуются на одном и том же массиве — O(n²) проигрывает O(n log n) в реальном времени.',
    },
    writeup: {
      en: [
        'Every panel above starts from the same shuffled array and runs a different algorithm: bubble, insertion, and selection sort on the quadratic side, quicksort and merge sort on the O(n log n) side. The bars are array values, the highlighted pair is whatever the algorithm is currently comparing or moving, and the step counter is the honest cost metric — every comparison, swap, and write counts as one step.',
        'The race makes asymptotic complexity tangible. At 30 elements the quadratic algorithms still look respectable; drag the size slider to 60 and the gap explodes, because doubling n roughly quadruples their work while quicksort and merge sort only slightly more than double theirs. That is the whole story of O(n²) versus O(n log n) compressed into a few seconds of animation. You can also see character differences within a class: insertion sort finishes early on nearly-sorted data, selection sort does few swaps but never fewer comparisons, and merge sort pays for its predictability with extra writes.',
        'Architecturally the demo is built on step replay. The algorithms live in a pure TypeScript module with no React imports: each one takes an array and returns a full list of steps — compare, swap, or set — without mutating its input. The UI is just a player: it precomputes the step lists once per shuffle, then advances each algorithm a few steps per animation frame, applying them to a local copy of the array. Rendering never re-runs an algorithm, and per-frame work stays proportional to the number of panels.',
        'That separation is what makes the demo trustworthy. The pure layer is covered by unit tests that replay every algorithm across a matrix of sizes and seeds and assert the result equals a reference sort — including a worst-case guard for quicksort on already-sorted input. The shuffle itself is a seeded PRNG, so every run is reproducible. If a visual ever looks wrong, the tests tell you immediately whether the bug is in the algorithm or in the player.',
      ],
      ru: [
        'Каждая панель выше стартует с одного и того же перемешанного массива и запускает свой алгоритм: пузырёк, вставки и выбор — квадратичные, быстрая сортировка и сортировка слиянием — O(n log n). Столбики — значения массива, подсвеченная пара — то, что алгоритм сравнивает или перемещает прямо сейчас, а счётчик шагов — честная метрика стоимости: каждое сравнение, обмен и запись считается за один шаг.',
        'Гонка делает асимптотическую сложность осязаемой. На 30 элементах квадратичные алгоритмы ещё выглядят прилично; сдвиньте слайдер размера до 60 — и разрыв взрывается: удвоение n примерно вчетверо увеличивает их работу, тогда как у quicksort и merge sort она вырастает лишь немногим больше, чем вдвое. Вся разница между O(n²) и O(n log n) — в нескольких секундах анимации. Видны и характеры внутри одного класса: сортировка вставками рано финиширует на почти отсортированных данных, сортировка выбором делает мало обменов, но не экономит на сравнениях, а merge sort платит за предсказуемость дополнительными записями.',
        'Архитектурно демо построено на воспроизведении шагов. Алгоритмы живут в чистом TypeScript-модуле без единого импорта React: каждый принимает массив и возвращает полный список шагов — compare, swap или set, — не мутируя вход. UI — просто плеер: он один раз предвычисляет списки шагов на каждый шаффл, а затем продвигает каждый алгоритм на несколько шагов за кадр анимации, применяя их к локальной копии массива. Рендер никогда не перезапускает алгоритм, и работа на кадр пропорциональна числу панелей.',
        'Именно это разделение делает демо надёжным. Чистый слой покрыт юнит-тестами: каждый алгоритм прогоняется по матрице размеров и сидов, а результат сверяется с эталонной сортировкой — включая проверку худшего случая quicksort на уже отсортированном входе. Сам шаффл — детерминированный PRNG с сидом, так что любой запуск воспроизводим. Если визуализация когда-нибудь поведёт себя странно, тесты сразу скажут, где баг — в алгоритме или в плеере.',
      ],
    },
  },
];

export function getDemo(slug: string): Demo | undefined {
  return demos.find((d) => d.slug === slug);
}
