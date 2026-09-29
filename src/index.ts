import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-agent'
import type { PreStepDecision } from '@deepseek-ai/dsh-agent'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import type { ContextFormed } from '@deepseek-ai/dsh-llm'

export const name = 'deepseek-harness-zh-cn'

export const inject: string[] = []

/**
 * 本插件在会话日志里的 producer 身份。
 *
 * DSH 0.1.7（session format v4）取消了共享的 `kind: 'plugin'`，消息来源必须是
 * 「producer 自有的 kind」。第三方插件沿用 v3→v4 迁移器为未登记 producer 生成的
 * `plugin:<包名>` 命名空间，使本插件写入的新消息与旧会话迁移后的 kind 保持一致。
 */
const SOURCE_KIND = 'plugin:deepseek-harness-zh-cn'

declare module '@deepseek-ai/dsh-llm' {
  interface MessageSourceMap {
    'plugin:deepseek-harness-zh-cn': { kind: 'plugin:deepseek-harness-zh-cn' } & ContextFormed
  }
}

const ZH_DIRECTIVE = [
  '始终使用简体中文进行思考（reasoning）与所有最终回答。',
  '计划、工具调用、总结、代码注释同样使用简体中文。',
  '仅代码、命令、文件路径、变量名、API 名称等必须原样保留的内容使用英文。',
  '除非用户明确要求其他语言，否则本规则优先。',
].join('\n')

export function apply(ctx: Context): void {
  ctx.on('agent/pre-step', async ({ step, signal }, next): Promise<PreStepDecision> => {
    const decision = await next()
    if (decision.kind === 'reject' || signal.aborted) return decision
    if (step !== 1) return decision
    return {
      kind: 'enter',
      messages: [
        ...decision.messages,
        createUserMessage({
          content: [{ type: 'text', text: `<system-reminder>\n${ZH_DIRECTIVE}\n</system-reminder>` }],
          source: { kind: SOURCE_KIND, form: 'snapshot', sections: [{ name, text: ZH_DIRECTIVE }] },
        }),
      ],
    }
  }, { prepend: true })
}