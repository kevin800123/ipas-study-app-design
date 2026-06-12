import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SummaryBlocks } from './SummaryBlocks'
import type { SummaryBlock } from '../types'

describe('SummaryBlocks', () => {
  it('renders text, keypoints and table blocks', () => {
    const blocks: SummaryBlock[] = [
      { type: 'text', content: '說明文字' },
      { type: 'keypoints', items: ['重點一'] },
      { type: 'table', headers: ['欄'], rows: [['值']] },
    ]
    render(<SummaryBlocks blocks={blocks} />)
    expect(screen.getByText('說明文字')).toBeInTheDocument()
    expect(screen.getByText('重點一')).toBeInTheDocument()
    expect(screen.getByText('值')).toBeInTheDocument()
  })
})
