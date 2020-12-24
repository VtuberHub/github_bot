import * as core from '@actions/core'

const escapeRegExp: Function = (string: String): String => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

const compareLabels: Function = (labels: string[]): Function => {
  const labelsDict = getLabelsDict()
  const hasKeys = Object.keys(labelsDict).length !== 0
  if (hasKeys) {
    const labelsRegex = new RegExp(
      labels
        .map(elem => {
          if (labelsDict[elem] === undefined) {
            return `\\b${escapeRegExp(elem)}\\b`
          } else {
            return [elem, ...labelsDict[elem]]
              .map(synonym => `\\b${escapeRegExp(synonym)}\\b`)
              .join('|')
          }
        })
        .join('|'),
      'gi'
    )
    let synonymsObject: Object = {}
    for (let label in labelsDict) {
        labelsDict[label].forEach(synonym => {
        synonymsObject[synonym.toLowerCase()] = label
      })
    }
    const hasLabels = (line: string): string[] => {
      const selectedLabels = line.match(labelsRegex) || []
      return selectedLabels.map(elem => {
        return (
          synonymsObject[elem.toLowerCase()] ||
          labels.find(label => label.toLowerCase() === elem.toLowerCase()) ||
          elem
        )
      })
    }
    return hasLabels
  } else {
    const labelsRegex = new RegExp(
      labels.map(elem => `\\b${escapeRegExp(elem)}\\b`).join('|'),
      'gi'
    )
    const hasLabels = (line: string): string[] => {
      const selectedLabels = line.match(labelsRegex) || []
      return selectedLabels.map(elem => {
        return (
          labels.find(label => label.toLowerCase() === elem.toLowerCase()) ||
          elem
        )
      })
    }
    return hasLabels
  }
}

const parseAutoLabel = (body: string): string => {
  const autoLabelRegex = new RegExp(
    /<!-- AUTO-LABEL:START -->(?<label>(\s*\w.+|\n)*?)\s*<!-- AUTO-LABEL:END -->/,
    'gm'
  )
  const autoLabels = body.match(autoLabelRegex)

  if (!autoLabels) return body

  const replaceAutoLabelByLabelValue = autoLabel =>
    autoLabel.replace(autoLabelRegex, '$1').trim()

  return autoLabels.map(replaceAutoLabelByLabelValue).join(' ')
}

const getIssueLabels: Function = (body: string, labels: string[]): string[] => {
  let selectedLabels: string[] = []
  let hasLabels: Function = compareLabels(labels)
  const ignoreComments = getIgnoreComments()

  const parsedBody = parseAutoLabel(body)

  if (ignoreComments) {
    const noCommentaryBody = parsedBody.replace(/\<!--(.|\n)*?-->/g, '')
    hasLabels(noCommentaryBody).map(elem => {
      selectedLabels.push(elem)
    })
  } else {
    hasLabels(parsedBody).map(elem => {
      selectedLabels.push(elem)
    })
  }
  return [...new Set([...selectedLabels])]
}

const getLabelsNotAllowed: Function = (): string[] => {
  return core.getInput('labels-not-allowed')
    ? JSON.parse(core.getInput('labels-not-allowed'))
    : []
}

const getLabelsDict: Function = (): unknown => {
  return core.getInput('labelsDict')
    ? JSON.parse(core.getInput('labelsDict'))
    : {}
}

const getIgnoreComments: Function = (): boolean => {
  return core.getInput('ignore-comments')
    ? core.getInput('ignore-comments') === 'true'
    : true
}

export {
  compareLabels,
  getIssueLabels,
  getLabelsNotAllowed,
  getLabelsDict,
  getIgnoreComments
}