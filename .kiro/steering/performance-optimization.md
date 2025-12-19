---
inclusion: manual
---

# Performance Optimization Guidelines

## Frontend Performance

### React Component Optimization

#### Lazy Loading
```typescript
// Implement lazy loading for heavy components
const ExamEvaluator = lazy(() => import('./components/ExamEvaluator'));
const Analytics = lazy(() => import('./components/Analytics'));

// Use Suspense with loading fallbacks
<Suspense fallback={<LoadingSpinner />}>
  <ExamEvaluator />
</Suspense>
```

#### Memoization
```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <ComplexVisualization data={data} />;
});

// Use useMemo for expensive calculations
const processedData = useMemo(() => {
  return expensiveDataProcessing(rawData);
}, [rawData]);

// Use useCallback for stable function references
const handleSubmit = useCallback((data) => {
  submitEvaluation(data);
}, [submitEvaluation]);
```

#### Virtual Scrolling
```typescript
// For large lists (evaluation history, student lists)
import { FixedSizeList as List } from 'react-window';

const VirtualizedList = ({ items }) => (
  <List
    height={600}
    itemCount={items.length}
    itemSize={50}
    itemData={items}
  >
    {Row}
  </List>
);
```

### Bundle Optimization

#### Code Splitting
```typescript
// Route-based code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

// Feature-based splitting
const IGCSEFeatures = lazy(() => import('./features/IGCSE'));
```

#### Tree Shaking
```typescript
// Import only what you need
import { debounce } from 'lodash/debounce';
// Instead of: import _ from 'lodash';

// Use ES modules for better tree shaking
export { specificFunction } from './utils';
```

### Asset Optimization

#### Image Optimization
- Use WebP format with fallbacks
- Implement responsive images with srcset
- Lazy load images below the fold
- Compress images before deployment

#### Font Optimization
```css
/* Preload critical fonts */
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>

/* Use font-display: swap for better loading */
@font-face {
  font-family: 'Inter';
  font-display: swap;
  src: url('/fonts/inter.woff2') format('woff2');
}
```

## Backend Performance

### Database Optimization

#### Query Optimization
```sql
-- Use indexes for frequently queried columns
CREATE INDEX idx_evaluations_student_id ON evaluations(student_id);
CREATE INDEX idx_evaluations_created_at ON evaluations(created_at);

-- Use composite indexes for multi-column queries
CREATE INDEX idx_evaluations_student_date ON evaluations(student_id, created_at);
```

#### Connection Pooling
```typescript
// Configure Supabase connection pooling
const supabase = createClient(url, key, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: true,
  },
  global: {
    headers: { 'x-my-custom-header': 'my-app-name' },
  },
});
```

### API Performance

#### Caching Strategies
```typescript
// Implement Redis caching for frequently accessed data
const getCachedEvaluation = async (id: string) => {
  const cached = await redis.get(`evaluation:${id}`);
  if (cached) return JSON.parse(cached);
  
  const evaluation = await database.getEvaluation(id);
  await redis.setex(`evaluation:${id}`, 3600, JSON.stringify(evaluation));
  return evaluation;
};
```

#### Request Optimization
```typescript
// Batch API requests
const batchEvaluations = async (evaluationIds: string[]) => {
  const evaluations = await Promise.all(
    evaluationIds.map(id => getEvaluation(id))
  );
  return evaluations;
};

// Implement request deduplication
const requestCache = new Map();
const deduplicatedRequest = async (key: string, requestFn: () => Promise<any>) => {
  if (requestCache.has(key)) {
    return requestCache.get(key);
  }
  
  const promise = requestFn();
  requestCache.set(key, promise);
  
  try {
    const result = await promise;
    return result;
  } finally {
    requestCache.delete(key);
  }
};
```

## PDF Processing Optimization

### Efficient PDF Handling
```typescript
// Process PDFs in chunks to avoid memory issues
const processPDFInChunks = async (pdfBuffer: Buffer) => {
  const chunkSize = 5; // Process 5 pages at a time
  const totalPages = await getPDFPageCount(pdfBuffer);
  
  const results = [];
  for (let i = 0; i < totalPages; i += chunkSize) {
    const chunk = await extractPagesRange(pdfBuffer, i, i + chunkSize);
    results.push(...chunk);
    
    // Allow garbage collection between chunks
    await new Promise(resolve => setImmediate(resolve));
  }
  
  return results;
};
```

### Memory Management
```typescript
// Clean up PDF.js resources
const cleanupPDFResources = (pdf: PDFDocumentProxy) => {
  pdf.cleanup();
  pdf.destroy();
};

// Use streaming for large files
const streamPDFProcessing = async (fileStream: ReadableStream) => {
  const reader = fileStream.getReader();
  const chunks = [];
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  
  return processChunks(chunks);
};
```

## AI API Optimization

### Request Batching
```typescript
// Batch multiple evaluations in single API call
const batchEvaluateExams = async (examPapers: ExamPaper[]) => {
  const batchSize = 5;
  const batches = [];
  
  for (let i = 0; i < examPapers.length; i += batchSize) {
    batches.push(examPapers.slice(i, i + batchSize));
  }
  
  const results = await Promise.all(
    batches.map(batch => evaluateBatch(batch))
  );
  
  return results.flat();
};
```

### Response Caching
```typescript
// Cache AI responses for identical inputs
const getCachedEvaluation = async (inputHash: string) => {
  const cached = await cache.get(`ai_evaluation:${inputHash}`);
  if (cached) return cached;
  
  const result = await callGeminiAPI(input);
  await cache.set(`ai_evaluation:${inputHash}`, result, { ttl: 86400 }); // 24 hours
  
  return result;
};
```

## Monitoring and Metrics

### Performance Monitoring
```typescript
// Track component render times
const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      analytics.track('component_render_time', {
        component: componentName,
        duration: endTime - startTime
      });
    };
  }, [componentName]);
};
```

### Core Web Vitals
```typescript
// Monitor Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## Performance Budgets

### Bundle Size Limits
- Main bundle: < 250KB gzipped
- Individual chunks: < 100KB gzipped
- Total JavaScript: < 500KB gzipped

### Loading Performance Targets
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1

### API Performance Targets
- PDF processing: < 30s for 20-page documents
- AI evaluation: < 2 minutes per exam
- Database queries: < 100ms for simple queries
- File uploads: Support up to 10MB files

## Optimization Tools

### Build Tools
```javascript
// Vite optimization configuration
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          pdf: ['pdfjs-dist', 'react-pdf'],
          ui: ['@headlessui/react', 'framer-motion']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['pdfjs-dist']
  }
});
```

### Analysis Tools
- Bundle Analyzer: Analyze bundle composition
- Lighthouse: Performance auditing
- React DevTools Profiler: Component performance
- Chrome DevTools: Runtime performance analysis