/**
 * 原型假数据（wayfinder 票 P1）。无持久化，刷新即回到这里。
 * 形状照抄真实的 ChatSession / UIMessage：类型（qa/discussion）、状态、标题、消息。
 */

export interface MockMessage {
  readonly id: string;
  readonly role: 'teacher' | 'user' | 'peer';
  readonly name: string;
  readonly text: string;
  readonly time: string;
  readonly interrupted?: boolean;
  readonly actionTag?: string;
}

export interface MockSession {
  readonly id: string;
  readonly title: string;
  readonly kind: 'qa' | 'discussion';
  readonly status: 'live' | 'ended' | 'interrupted';
  readonly time: string;
  readonly group: 'today' | 'yesterday' | 'earlier';
  readonly messages: readonly MockMessage[];
}

export const MOCK_SESSIONS: readonly MockSession[] = [
  {
    id: 's1',
    title: '红黑树和 AVL 树的区别是什么',
    kind: 'qa',
    status: 'live',
    time: '刚刚',
    group: 'today',
    messages: [
      {
        id: 'm1',
        role: 'user',
        name: '我',
        text: '红黑树和 AVL 树的区别是什么？',
        time: '14:02',
      },
      {
        id: 'm2',
        role: 'teacher',
        name: '张老师',
        text: '好问题。两者都是自平衡二叉搜索树，区别在"平衡得多严格"。AVL 树要求任意节点的左右子树高度差不超过 1，所以它更矮、查询更快；代价是每次插入删除都要做更多旋转。红黑树放宽到"最长路径不超过最短路径的两倍"，插入删除的旋转次数更少。',
        time: '14:02',
        actionTag: '高亮 · 第 12 页',
      },
      {
        id: 'm3',
        role: 'user',
        name: '我',
        text: '那实际写代码的时候该选哪个？',
        time: '14:03',
      },
      {
        id: 'm4',
        role: 'teacher',
        name: '张老师',
        text: '看读写比例。查多写少就 AVL；读写都多就用红黑树——这也是为什么大多数标准库的有序表用红黑树。',
        time: '14:03',
      },
    ],
  },
  {
    id: 's2',
    title: '这段中序遍历的代码为什么用栈',
    kind: 'qa',
    status: 'ended',
    time: '13:40',
    group: 'today',
    messages: [
      { id: 'm5', role: 'user', name: '我', text: '这段中序遍历的代码为什么用栈？', time: '13:40' },
      {
        id: 'm6',
        role: 'teacher',
        name: '张老师',
        text: '因为递归本身用的就是调用栈，改成迭代就得自己把这个栈显式建出来。',
        time: '13:40',
      },
    ],
  },
  {
    id: 's3',
    title: '小组讨论：为什么需要平衡二叉树',
    kind: 'discussion',
    status: 'ended',
    time: '13:22',
    group: 'today',
    messages: [
      {
        id: 'm7',
        role: 'peer',
        name: '小林',
        text: '我觉得是因为普通二叉搜索树在有序插入时会退化成链表。',
        time: '13:22',
      },
      {
        id: 'm8',
        role: 'teacher',
        name: '张老师',
        text: '对，这就是最关键的动机。那退化之后查找复杂度变成多少？',
        time: '13:23',
      },
    ],
  },
  {
    id: 's4',
    title: '时间复杂度 O(log n) 是怎么算出来的',
    kind: 'qa',
    status: 'ended',
    time: '昨天 20:11',
    group: 'yesterday',
    messages: [
      {
        id: 'm9',
        role: 'user',
        name: '我',
        text: '时间复杂度 O(log n) 是怎么算出来的？',
        time: '20:11',
      },
      {
        id: 'm10',
        role: 'teacher',
        name: '张老师',
        text: '从"每次比较能排除多少种可能"入手：每次排除一半，n 个元素最多比较 log₂n 次。',
        time: '20:11',
      },
    ],
  },
  {
    id: 's5',
    title: '递归和迭代在内存上有什么区别',
    kind: 'qa',
    status: 'interrupted',
    time: '昨天 19:03',
    group: 'yesterday',
    messages: [
      {
        id: 'm11',
        role: 'user',
        name: '我',
        text: '递归和迭代在内存上有什么区别？',
        time: '19:03',
      },
      {
        id: 'm12',
        role: 'teacher',
        name: '张老师',
        text: '递归每一层都会在调用栈上留一个栈帧，深度大的时候…',
        time: '19:03',
        interrupted: true,
      },
    ],
  },
  {
    id: 's6',
    title: '哈希冲突的处理方式有哪些',
    kind: 'qa',
    status: 'ended',
    time: '周一 10:30',
    group: 'earlier',
    messages: [
      {
        id: 'm13',
        role: 'user',
        name: '我',
        text: '哈希冲突的处理方式有哪些？',
        time: '10:30',
      },
      {
        id: 'm14',
        role: 'teacher',
        name: '张老师',
        text: '主流是链地址法和开放定址法两大类，各有各的取舍。',
        time: '10:30',
      },
    ],
  },
];

export const GROUP_LABELS: Record<MockSession['group'], string> = {
  today: '今天',
  yesterday: '昨天',
  earlier: '更早',
};

export const CURRENT_SESSION = MOCK_SESSIONS[0];

/** 「另一端还有讨论在进行」演示态里学生正看着的那段——一段已经结束的小组讨论。 */
export const ENDED_DISCUSSION_SESSION =
  MOCK_SESSIONS.find((session) => session.kind === 'discussion') ?? CURRENT_SESSION;

export const COURSE = {
  name: '数据结构与算法 · 第 7 讲',
  slide: '平衡二叉树',
  slideIndex: 12,
  slideTotal: 34,
};
