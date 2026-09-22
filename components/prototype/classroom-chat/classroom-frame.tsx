'use client';

/**
 * 原型宿主外壳（wayfinder 票 P1）：按真实比例摆出课堂的三个区域——课件区、
 * 底部 192px 横条、右侧面板——好让面板变体"贴着真实的密度"被判断，
 * 而不是孤零零地待在一个空页面里。
 *
 * 这里只画静态的假课堂，不引用任何现有课堂组件。
 */

import type { ReactNode } from 'react';
import {
  Download,
  Maximize2,
  MessageSquare,
  Mic,
  Monitor,
  MonitorPlay,
  Settings,
} from 'lucide-react';
import { AvatarDisplay } from '@/components/ui/avatar-display';
import { COURSE } from './mock-data';

function TopBar() {
  return (
    <div className="flex h-[52px] shrink-0 items-center gap-2 px-3">
      <div className="flex items-center gap-1 rounded-full border border-gray-200/70 bg-white/70 px-2 py-1 backdrop-blur">
        <button className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-gray-700">
          CN
        </button>
        <button className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">
          <Monitor className="h-4 w-4" />
        </button>
        <button className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">
          <Settings className="h-4 w-4" />
        </button>
        <button className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">
          <Download className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function SlideArea() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-8 pb-4">
      <div className="flex aspect-video w-full max-w-[720px] flex-col items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="text-[10px] tracking-wide text-gray-400">{COURSE.name}</div>
        <div className="mt-1 text-2xl font-semibold text-gray-800">{COURSE.slide}</div>
        <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400">
          <span>
            第 {COURSE.slideIndex} / {COURSE.slideTotal} 页
          </span>
        </div>
        <div className="mt-4 flex gap-2">
          {['AVL', '红黑树', '旋转'].map((label) => (
            <span
              key={label}
              className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-[10px] text-purple-600"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoundtableBar({ showStudentControls }: { readonly showStudentControls: boolean }) {
  return (
    <div className="h-[192px] w-full shrink-0 px-3 pb-3">
      <div className="flex h-full w-full flex-col rounded-2xl border border-gray-200/70 bg-white/70 backdrop-blur-xl">
        <div className="flex items-center justify-end gap-1 px-3 pt-2">
          <button className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100">
            <MessageSquare className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 items-stretch gap-3 px-3 pb-3">
          {/* 老师身份 */}
          <div className="flex w-[90px] shrink-0 flex-col items-center justify-center gap-1">
            <div className="h-11 w-11 overflow-hidden rounded-full border-2 border-purple-400 bg-gray-50">
              <AvatarDisplay src="/avatars/teacher.png" alt="张老师" />
            </div>
            <div className="text-[10px] font-medium text-gray-600">张老师</div>
            <div className="text-[9px] text-gray-400">授课中</div>
          </div>

          {/* 气泡舞台 */}
          <div className="flex min-w-0 flex-1 items-center justify-center">
            <div className="max-w-[92%] rounded-2xl border border-gray-100 bg-white px-3 py-2 text-[11px] leading-relaxed text-gray-700 shadow-sm">
              好问题。两者都是自平衡二叉搜索树，区别在“平衡得多严格”——
              <span className="text-gray-400"> AVL 更矮、查询更快；红黑树插入删除旋转更少。</span>
            </div>
          </div>

          {/* 右栏：改造前是学生控件，改造后空出来 */}
          <div className="flex w-[140px] shrink-0 flex-col items-center justify-center gap-2">
            {showStudentControls ? (
              <>
                <div className="flex gap-1.5">
                  <button className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm">
                    <Mic className="h-3.5 w-3.5" />
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm">
                    <MessageSquare className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-white bg-gray-50 opacity-60">
                  <AvatarDisplay src="/avatars/user.png" alt="我" />
                </div>
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-gray-300/80 px-2 text-center">
                <span className="text-[9px] leading-tight text-gray-400">
                  学生控件已撤走
                  <br />
                  （原型标注）
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClassroomFrame({
  showStudentControls,
  panel,
  narrowPanel,
}: {
  readonly showStudentControls: boolean;
  readonly panel: ReactNode;
  readonly narrowPanel: boolean;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 text-gray-900">
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <SlideArea />
        <RoundtableBar showStudentControls={showStudentControls} />
      </div>
      <div
        className="relative flex shrink-0 flex-col overflow-hidden border-l border-gray-100 bg-white/80 shadow-[-2px_0_24px_rgba(0,0,0,0.02)] backdrop-blur-xl"
        style={{ width: narrowPanel ? 240 : 340, transition: 'width 0.3s ease' }}
      >
        {panel}
      </div>
    </div>
  );
}

/**
 * 全屏讲课：右侧面板被强制收起，输入条移进右侧黑框（幻灯片区之外），
 * 因此永远不会遮挡课件内容——任何屏幕比例下都成立。
 */
export function FullscreenStage({ composer }: { readonly composer: ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-900 text-white">
      {/* 幻灯片区：只放课件，不再叠任何悬浮件 */}
      <div className="relative flex min-w-0 flex-1 items-center justify-center p-8">
        <div className="flex aspect-video w-full max-w-[1100px] flex-col items-center justify-center rounded-xl bg-white shadow-2xl">
          <div className="text-xs tracking-wide text-gray-400">{COURSE.name}</div>
          <div className="mt-2 text-4xl font-semibold text-gray-800">{COURSE.slide}</div>
          <div className="mt-6 flex gap-2">
            {['AVL', '红黑树', '旋转'].map((label) => (
              <span
                key={label}
                className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs text-purple-600"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 右侧黑框：全屏时的全部控件都住这里，课件区一个悬浮件都没有 */}
      <div className="flex w-[268px] shrink-0 flex-col gap-3 border-l border-white/10 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-[11px]">
            第 {COURSE.slideIndex} / {COURSE.slideTotal} 页
          </span>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
            <MonitorPlay className="h-4 w-4" />
          </button>
        </div>
        <span className="rounded-lg bg-white/5 px-2 py-1.5 text-[10px] leading-tight text-white/50">
          全屏时右侧面板不可达 · 输入条放这里，不遮挡课件
        </span>
        <div className="flex-1" />
        <div>{composer}</div>
        <div className="flex items-center justify-center gap-2 pt-0.5">
          <button className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 hover:bg-white/10">
            <Mic className="h-4 w-4" />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 hover:bg-white/10">
            <MessageSquare className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
