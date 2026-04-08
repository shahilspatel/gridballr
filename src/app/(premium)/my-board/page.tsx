import { TerminalHeader } from '@/components/layout/terminal-header'
import { MyBoardBuilder } from '@/components/board/my-board-builder'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Board — Custom Draft Board Builder',
  description:
    'Build and customize your own NFL draft big board with drag-and-drop rankings, notes, and export.',
}

export default function MyBoardPage() {
  return (
    <div>
      <TerminalHeader title="MY_BOARD" subtitle="Custom Draft Board Builder" status="BOARD_READY" />
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <MyBoardBuilder />
      </div>
    </div>
  )
}
