import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-agent'
import type { PreStepDecision } from '@deepseek-ai/dsh-agent'
import { createUserMessage } from '@deepseek-ai/dsh-llm'

export const name = 'deepseek-harness-zh-cn'

export const inject: string[] = []

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
          source: { kind: 'plugin', plugin: name, form: 'snapshot', sections: [{ name, text: ZH_DIRECTIVE }] },
        }),
      ],
    }
  }, { prepend: true })
}