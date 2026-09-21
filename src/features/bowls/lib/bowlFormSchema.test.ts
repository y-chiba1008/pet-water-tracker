import { describe, expect, it } from 'vitest'
import { bowlFormSchema } from '@/features/bowls/lib/bowlFormSchema'

describe('bowlFormSchema', () => {
  it('accepts a valid bowl name', () => {
    const result = bowlFormSchema.safeParse({ name: 'リビング' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('リビング')
    }
  })

  it('trims whitespace', () => {
    const result = bowlFormSchema.safeParse({ name: '  寝室  ' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('寝室')
    }
  })

  it('rejects empty names', () => {
    const result = bowlFormSchema.safeParse({ name: '   ' })
    expect(result.success).toBe(false)
  })

  it('rejects names longer than 40 characters', () => {
    const result = bowlFormSchema.safeParse({ name: 'あ'.repeat(41) })
    expect(result.success).toBe(false)
  })
})
