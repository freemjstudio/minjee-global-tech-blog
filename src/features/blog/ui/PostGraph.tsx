import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BookOpen, CircleDot, Network, Tags } from 'lucide-react'
import { Badge } from '@/shared/ui/Badge'
import { formatDateShort } from '@/shared/lib/formatDate'
import type { Category, PostGraph as PostGraphData, PostGraphNode, Tag } from '../model/post.types'

const WIDTH = 980
const HEIGHT = 660
const HIGH_LEVEL_TOPIC_SLUGS = [
  'distributed-systems',
  'kafka',
  'spark',
  'backend',
  'system-design',
  'architecture',
]

const TOPIC_LABELS: Record<string, string> = {
  spark: 'Apache Spark',
  kafka: 'Kafka',
  backend: 'Backend',
  architecture: 'Architecture',
  'system-design': 'System Design',
  'distributed-systems': 'Distributed Systems',
  'data-engineering': 'Data Engineering',
  'spring-boot': 'Spring Boot',
}

const TOPIC_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  'distributed-systems': { fill: '#CCFBF1', stroke: '#2DD4BF', text: '#0F766E' },
  kafka: { fill: '#CCFBF1', stroke: '#2DD4BF', text: '#0F766E' },
  spark: { fill: '#DBEAFE', stroke: '#60A5FA', text: '#2563EB' },
  'apache-spark': { fill: '#DBEAFE', stroke: '#60A5FA', text: '#2563EB' },
  backend: { fill: '#EDE9FE', stroke: '#A78BFA', text: '#7C3AED' },
  kotlin: { fill: '#EDE9FE', stroke: '#A78BFA', text: '#7C3AED' },
  'spring-boot': { fill: '#EDE9FE', stroke: '#A78BFA', text: '#7C3AED' },
  'system-design': { fill: '#FFEDD5', stroke: '#FB923C', text: '#C2410C' },
  architecture: { fill: '#F3F4F6', stroke: '#9CA3AF', text: '#4B5563' },
  'data-engineering': { fill: '#DBEAFE', stroke: '#60A5FA', text: '#2563EB' },
}

const DEFAULT_TOPIC_COLOR = { fill: '#F7F8FA', stroke: '#D1D5DB', text: '#4B5563' }

interface TopicNode {
  id: string
  type: 'topic'
  title: string
  slug: string
  category?: Category
  description: string
  articleSlugs: string[]
  relatedTopicSlugs: string[]
  x: number
  y: number
}

interface ArticleNode extends PostGraphNode {
  id: string
  type: 'article'
  description: string
  topicSlugs: string[]
  relatedArticleSlugs: string[]
  x: number
  y: number
}

type KnowledgeNode = TopicNode | ArticleNode

interface KnowledgeEdge {
  source: string
  target: string
  type: 'topic-article' | 'topic-topic' | 'article-article'
}

interface KnowledgeGraph {
  nodes: KnowledgeNode[]
  edges: KnowledgeEdge[]
  topics: TopicNode[]
  articles: ArticleNode[]
}

interface PostGraphProps {
  graph: PostGraphData
}

interface TooltipState {
  node: KnowledgeNode
  x: number
  y: number
}

function topicColor(slug: string) {
  return TOPIC_COLORS[slug] ?? DEFAULT_TOPIC_COLOR
}

function shortLabel(value: string, max = 24) {
  return value.length > max ? `${value.slice(0, max - 3)}...` : value
}

function topicDescription(topic: TopicNode) {
  const count = topic.articleSlugs.length
  return `${count} ${count === 1 ? 'article' : 'articles'} connected to ${topic.title}.`
}

function articleTopics(article: PostGraphNode) {
  const topics = new Map<string, { slug: string; title: string; category?: Category }>()

  if (article.category) {
    topics.set(article.category.slug, {
      slug: article.category.slug,
      title: TOPIC_LABELS[article.category.slug] ?? article.category.name,
      category: article.category,
    })
  }

  article.tags.forEach((tag) => {
    topics.set(tag.slug, {
      slug: tag.slug,
      title: TOPIC_LABELS[tag.slug] ?? tag.name,
      category: article.category,
    })
  })

  return Array.from(topics.values())
}

function buildKnowledgeGraph(graph: PostGraphData): KnowledgeGraph {
  const topicMap = new Map<string, Omit<TopicNode, 'type' | 'description' | 'relatedTopicSlugs' | 'x' | 'y'>>()
  const articleRelated = new Map<string, Set<string>>()

  graph.nodes.forEach((article) => {
    articleTopics(article).forEach((topic) => {
      const current = topicMap.get(topic.slug)
      topicMap.set(topic.slug, {
        id: `topic:${topic.slug}`,
        title: topic.title,
        slug: topic.slug,
        category: topic.category,
        articleSlugs: [...(current?.articleSlugs ?? []), article.slug],
      })
    })
  })

  graph.edges.forEach((edge) => {
    if (edge.type !== 'related') return
    articleRelated.set(edge.source, new Set([...(articleRelated.get(edge.source) ?? []), edge.target]))
    articleRelated.set(edge.target, new Set([...(articleRelated.get(edge.target) ?? []), edge.source]))
  })

  const sortedTopics = Array.from(topicMap.values()).sort((a, b) => {
    const aPriority = HIGH_LEVEL_TOPIC_SLUGS.indexOf(a.slug)
    const bPriority = HIGH_LEVEL_TOPIC_SLUGS.indexOf(b.slug)
    if (aPriority !== -1 || bPriority !== -1) {
      if (aPriority === -1) return 1
      if (bPriority === -1) return -1
      return aPriority - bPriority
    }
    const byCount = b.articleSlugs.length - a.articleSlugs.length
    return byCount === 0 ? a.title.localeCompare(b.title) : byCount
  })

  const primaryTopics = sortedTopics.slice(0, Math.max(6, Math.min(10, sortedTopics.length)))
  const topicRadius = 230
  const topics: TopicNode[] = primaryTopics.map((topic, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / Math.max(primaryTopics.length, 1)
    return {
      ...topic,
      type: 'topic',
      description: '',
      relatedTopicSlugs: [],
      x: WIDTH / 2 + Math.cos(angle) * topicRadius,
      y: HEIGHT / 2 + Math.sin(angle) * topicRadius * 0.7,
    }
  })

  const visibleTopicSlugs = new Set(topics.map((topic) => topic.slug))
  const articleRadius = 84
  const articles: ArticleNode[] = graph.nodes.map((article, index) => {
    const topicSlugs = articleTopics(article)
      .map((topic) => topic.slug)
      .filter((slug) => visibleTopicSlugs.has(slug))
    const anchorTopic = topics.find((topic) => topic.slug === topicSlugs[0])
    const fallbackAngle = -Math.PI / 2 + (Math.PI * 2 * index) / Math.max(graph.nodes.length, 1)
    const localAngle = fallbackAngle + (index % 3) * 0.78

    return {
      ...article,
      id: `article:${article.slug}`,
      type: 'article',
      description: article.excerpt,
      topicSlugs,
      relatedArticleSlugs: Array.from(articleRelated.get(article.slug) ?? []),
      x: (anchorTopic?.x ?? WIDTH / 2) + Math.cos(localAngle) * articleRadius,
      y: (anchorTopic?.y ?? HEIGHT / 2) + Math.sin(localAngle) * articleRadius * 0.82,
    }
  })

  const articleBySlug = new Map(articles.map((article) => [article.slug, article]))
  const topicEdges: KnowledgeEdge[] = []
  const relatedTopicMap = new Map<string, Set<string>>()

  topics.forEach((topic) => {
    topic.articleSlugs.forEach((slug) => {
      if (!articleBySlug.has(slug)) return
      topicEdges.push({ source: topic.id, target: `article:${slug}`, type: 'topic-article' })
    })
  })

  articles.forEach((article) => {
    article.topicSlugs.forEach((sourceTopic) => {
      article.topicSlugs.forEach((targetTopic) => {
        if (sourceTopic === targetTopic) return
        relatedTopicMap.set(sourceTopic, new Set([...(relatedTopicMap.get(sourceTopic) ?? []), targetTopic]))
      })
    })
  })

  const topicsWithRelations = topics.map((topic) => ({
    ...topic,
    description: topicDescription(topic),
    relatedTopicSlugs: Array.from(relatedTopicMap.get(topic.slug) ?? []),
  }))

  const topicBySlug = new Map(topicsWithRelations.map((topic) => [topic.slug, topic]))
  const topicTopicEdges = Array.from(relatedTopicMap.entries()).flatMap(([source, targets]) =>
    Array.from(targets)
      .filter((target) => source < target && topicBySlug.has(target))
      .map<KnowledgeEdge>((target) => ({
        source: `topic:${source}`,
        target: `topic:${target}`,
        type: 'topic-topic',
      })),
  )

  const articleArticleEdges = graph.edges
    .filter((edge) => edge.type === 'related')
    .map<KnowledgeEdge>((edge) => ({
      source: `article:${edge.source}`,
      target: `article:${edge.target}`,
      type: 'article-article',
    }))

  return {
    topics: topicsWithRelations,
    articles,
    nodes: [...topicsWithRelations, ...articles],
    edges: [...topicTopicEdges, ...topicEdges, ...articleArticleEdges],
  }
}

function getConnectedIds(node: KnowledgeNode, graph: KnowledgeGraph) {
  const ids = new Set<string>([node.id])

  if (node.type === 'topic') {
    node.articleSlugs.forEach((slug) => ids.add(`article:${slug}`))
    node.relatedTopicSlugs.forEach((slug) => ids.add(`topic:${slug}`))
  } else {
    node.topicSlugs.forEach((slug) => ids.add(`topic:${slug}`))
    node.relatedArticleSlugs.forEach((slug) => ids.add(`article:${slug}`))
  }

  graph.edges.forEach((edge) => {
    if (edge.source === node.id) ids.add(edge.target)
    if (edge.target === node.id) ids.add(edge.source)
  })

  return ids
}

function getVisibleIds(node: KnowledgeNode, graph: KnowledgeGraph) {
  const ids = new Set<string>()
  graph.topics.forEach((topic) => ids.add(topic.id))

  if (node.type === 'topic') {
    node.articleSlugs.forEach((slug) => ids.add(`article:${slug}`))
    node.relatedTopicSlugs.forEach((slug) => ids.add(`topic:${slug}`))
    return ids
  }

  ids.add(node.id)
  node.topicSlugs.forEach((slug) => ids.add(`topic:${slug}`))
  rankRelatedArticles(node, graph).forEach((article) => ids.add(article.id))
  return ids
}

function nodeConnectionCount(node: KnowledgeNode) {
  if (node.type === 'topic') return node.articleSlugs.length + node.relatedTopicSlugs.length
  return node.topicSlugs.length + node.relatedArticleSlugs.length
}

function nodeCategoryLabel(node: KnowledgeNode) {
  if (node.type === 'topic') return node.category?.name ?? 'Topic'
  return node.category?.name ?? 'Article'
}

function nodeReadingTime(node: KnowledgeNode) {
  return node.type === 'article' ? `${node.readingTimeMinutes} min read` : 'Topic'
}

function relatedArticlesFor(node: KnowledgeNode, graph: KnowledgeGraph) {
  if (node.type === 'topic') {
    return node.articleSlugs
      .map((slug) => graph.articles.find((article) => article.slug === slug))
      .filter(Boolean)
      .sort((a, b) => nodeConnectionCount(b as ArticleNode) - nodeConnectionCount(a as ArticleNode)) as ArticleNode[]
  }

  return rankRelatedArticles(node, graph)
}

function rankRelatedArticles(node: ArticleNode, graph: KnowledgeGraph) {
  const explicit = node.relatedArticleSlugs
    .map((slug) => graph.articles.find((article) => article.slug === slug))
    .filter(Boolean) as ArticleNode[]

  if (explicit.length > 0) {
    return explicit.sort((a, b) => nodeConnectionCount(b) - nodeConnectionCount(a))
  }

  return graph.articles
    .filter((article) => article.slug !== node.slug)
    .map((article) => ({
      article,
      score: article.topicSlugs.filter((slug) => node.topicSlugs.includes(slug)).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || nodeConnectionCount(b.article) - nodeConnectionCount(a.article))
    .map(({ article }) => article)
    .slice(0, 4)
}

function relatedTopicsFor(node: KnowledgeNode, graph: KnowledgeGraph) {
  if (node.type === 'topic') {
    return node.relatedTopicSlugs
      .map((slug) => graph.topics.find((topic) => topic.slug === slug))
      .filter(Boolean) as TopicNode[]
  }

  return node.topicSlugs
    .map((slug) => graph.topics.find((topic) => topic.slug === slug))
    .filter(Boolean) as TopicNode[]
}

export function PostGraph({ graph }: PostGraphProps) {
  const knowledgeGraph = useMemo(() => buildKnowledgeGraph(graph), [graph])
  const [selectedId, setSelectedId] = useState(knowledgeGraph.topics[0]?.id ?? knowledgeGraph.articles[0]?.id ?? '')
  const [hovered, setHovered] = useState<TooltipState | null>(null)

  const nodeById = useMemo(
    () => new Map(knowledgeGraph.nodes.map((node) => [node.id, node])),
    [knowledgeGraph.nodes],
  )
  const selectedNode = nodeById.get(selectedId) ?? knowledgeGraph.topics[0] ?? knowledgeGraph.articles[0]
  const connectedIds = selectedNode ? getConnectedIds(selectedNode, knowledgeGraph) : new Set<string>()
  const visibleIds = selectedNode ? getVisibleIds(selectedNode, knowledgeGraph) : new Set<string>()
  const relatedArticles = selectedNode ? relatedArticlesFor(selectedNode, knowledgeGraph) : []
  const relatedTopics = selectedNode ? relatedTopicsFor(selectedNode, knowledgeGraph) : []

  if (!selectedNode) return null

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,7fr)_minmax(300px,3fr)]">
      <section className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_14px_rgba(31,41,55,0.04)] dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-600 dark:text-accent-300">
              Knowledge Graph
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Topics lead the map. Articles explain the path between them.
            </p>
          </div>
          <Network className="h-5 w-5 text-accent-500" />
        </div>

        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Topic-first knowledge graph"
          className="aspect-[14/10] w-full bg-[#fbfbfa] dark:bg-gray-950"
        >
          <motion.g initial={false}>
            {knowledgeGraph.edges.map((edge) => {
              const source = nodeById.get(edge.source)
              const target = nodeById.get(edge.target)
              if (!source || !target) return null

              const active = connectedIds.has(edge.source) && connectedIds.has(edge.target)
              const visible = visibleIds.has(edge.source) && visibleIds.has(edge.target)
              return (
                <motion.line
                  key={`${edge.source}-${edge.target}-${edge.type}`}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={edge.type === 'topic-topic' ? '#9CA3AF' : '#D1D5DB'}
                  strokeWidth={active ? 1.8 : 1}
                  initial={false}
                  animate={{ opacity: visible ? (active ? 0.62 : 0.22) : 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                />
              )
            })}
          </motion.g>

          <g>
            {knowledgeGraph.nodes.map((node) => {
              const isTopic = node.type === 'topic'
              const selected = node.id === selectedNode.id
              const visible = visibleIds.has(node.id)
              const connected = connectedIds.has(node.id)
              const color = isTopic
                ? topicColor(node.slug)
                : topicColor(node.category?.slug ?? node.topicSlugs[0] ?? '')
              const radius = isTopic ? (selected ? 25 : 21) : selected ? 11 : 8
              const shouldRender = isTopic || visible

              if (!shouldRender) return null
              return (
                <motion.g
                  key={node.id}
                  role="button"
                  tabIndex={0}
                  aria-label={node.title}
                  className="cursor-pointer outline-none"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: connected || isTopic ? 1 : 0.24, scale: selected ? 1.03 : 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  onClick={() => setSelectedId(node.id)}
                  onMouseEnter={(event) => {
                    const bounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect()
                    setHovered({
                      node,
                      x: bounds ? event.clientX - bounds.left : node.x,
                      y: bounds ? event.clientY - bounds.top : node.y,
                    })
                  }}
                  onMouseLeave={() => setHovered(null)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') setSelectedId(node.id)
                  }}
                >
                  {isTopic && (
                    <motion.circle
                      cx={node.x}
                      cy={node.y}
                      animate={{ r: radius + 9, opacity: selected ? 0.24 : 0.12 }}
                      fill={color.fill}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                    />
                  )}
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    animate={{ r: radius }}
                    fill={isTopic ? color.fill : '#FFFFFF'}
                    stroke={selected ? color.stroke : isTopic ? color.stroke : color.fill}
                    strokeWidth={selected ? 3 : isTopic ? 2 : 1.6}
                    className="transition-all dark:fill-gray-950"
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  />
                  {(isTopic || selected) && (
                    <text
                      x={node.x}
                      y={node.y + (isTopic ? 42 : 29)}
                      textAnchor="middle"
                      className={`select-none ${isTopic ? 'text-[17px] font-semibold' : 'text-[12px] font-medium'} fill-gray-700 dark:fill-gray-200`}
                    >
                      {shortLabel(node.title, isTopic ? 22 : 32)}
                    </text>
                  )}
                </motion.g>
              )
            })}
          </g>
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute z-10 w-72 rounded-xl border border-gray-200 bg-white/95 p-4 shadow-[0_18px_60px_rgba(31,41,55,0.12)] backdrop-blur dark:border-gray-800 dark:bg-gray-950/95"
            style={{
              left: `min(calc(100% - 19rem), ${hovered.x + 18}px)`,
              top: `min(calc(100% - 12rem), ${hovered.y + 18}px)`,
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-600 dark:text-accent-300">
              {hovered.node.type}
            </p>
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{hovered.node.title}</h3>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
              {hovered.node.description}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{nodeCategoryLabel(hovered.node)}</span>
              <span>{nodeConnectionCount(hovered.node)} connections</span>
              <span>{nodeReadingTime(hovered.node)}</span>
            </div>
          </div>
        )}
      </section>

      <AnimatePresence mode="wait">
        <ExplorerPanel
          key={selectedNode.id}
          node={selectedNode}
          relatedArticles={relatedArticles}
          relatedTopics={relatedTopics}
          onSelect={(id) => setSelectedId(id)}
        />
      </AnimatePresence>
    </div>
  )
}

function ExplorerPanel({
  node,
  relatedArticles,
  relatedTopics,
  onSelect,
}: {
  node: KnowledgeNode
  relatedArticles: ArticleNode[]
  relatedTopics: TopicNode[]
  onSelect: (id: string) => void
}) {
  const category = node.category

  return (
    <motion.aside
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-[0_1px_14px_rgba(31,41,55,0.04)] dark:border-gray-800 dark:bg-gray-950"
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-600 dark:text-accent-300">
        {node.type === 'topic' ? <CircleDot className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
        Explorer
      </div>

      <h2 className="mt-5 text-2xl font-semibold leading-tight tracking-normal text-gray-900 dark:text-white">
        {node.title}
      </h2>

      <p className="mt-4 text-sm leading-7 text-gray-500 dark:text-gray-400">{node.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Badge variant="category">{category?.name ?? (node.type === 'topic' ? 'Topic' : 'Article')}</Badge>
        <Badge variant="outline">{nodeConnectionCount(node)} connections</Badge>
        {node.type === 'article' && <Badge variant="outline">{node.readingTimeMinutes} min read</Badge>}
      </div>

      {node.type === 'article' && (
        <>
          <div className="mt-6 space-y-3 text-sm">
            <PanelRow label="Published" value={formatDateShort(node.publishedAt)} />
            <PanelRow label="Reading Time" value={`${node.readingTimeMinutes} min read`} />
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
              <Tags className="h-3.5 w-3.5" />
              Tags
            </div>
            <div className="flex flex-wrap gap-2">
              {node.tags.map((tag: Tag) => (
                <Badge key={tag.id}>{tag.name}</Badge>
              ))}
            </div>
          </div>

          <Link
            to={`/blog/${node.slug}`}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-400 px-5 py-3 text-sm font-semibold text-gray-950 transition duration-200 hover:-translate-y-0.5 hover:bg-accent-500"
          >
            Read Article
            <ArrowRight className="h-4 w-4" />
          </Link>
        </>
      )}

      {relatedTopics.length > 0 && (
        <PanelList
          title={node.type === 'topic' ? 'Related Topics' : 'Topics'}
          items={relatedTopics.map((topic) => ({
            id: topic.id,
            title: topic.title,
            meta: `${topic.articleSlugs.length} articles`,
          }))}
          onSelect={onSelect}
        />
      )}

      {relatedArticles.length > 0 && (
        <PanelList
          title="Related Articles"
          items={relatedArticles.map((article) => ({
            id: article.id,
            title: article.title,
            meta: `${article.readingTimeMinutes} min read`,
          }))}
          onSelect={onSelect}
        />
      )}
    </motion.aside>
  )
}

function PanelRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 dark:border-gray-800">
      <span className="text-gray-400 dark:text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-700 dark:text-gray-300">{value}</span>
    </div>
  )
}

function PanelList({
  title,
  items,
  onSelect,
}: {
  title: string
  items: { id: string; title: string; meta: string }[]
  onSelect: (id: string) => void
}) {
  return (
    <div className="mt-8 border-t border-gray-200 pt-5 dark:border-gray-800">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
        {title}
      </p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className="block w-full rounded-xl px-3 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
          >
            <span className="block text-sm font-medium leading-6 text-gray-700 dark:text-gray-200">{item.title}</span>
            <span className="mt-1 block text-xs text-gray-400 dark:text-gray-500">{item.meta}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
