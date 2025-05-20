import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Button } from '@/pages/_components/Button';
import { Spacer } from '@/pages/_components/Spacer';
import { NewsPost } from '@/pages/authenticated/dashboard/_components/NewsPost';

const response = [
  {
    title: 'Testing Markdown Editor',
    content: `# Main Heading: Testing Markdown Editor

## Secondary Heading: Features Overview

This paragraph demonstrates **bold text** and *italic text* formatting options. You can also combine them for ***bold italic text*** when needed.

### Third-level heading with some details

Here's a bulleted list of test items:
- First item in the list
- Second item with **bold formatting**
- Third item with *italic text*
  - Nested item one
  - Nested item with \`inline code\`
  - Another nested item

Now for a numbered list:
1. First numbered item
2. Second numbered item
   1. Nested numbered item
   2. Another nested item
3. Third numbered item

> This is a blockquote that can be used for citations or highlighting important text.
> 
> It can span multiple paragraphs if needed.

#### Code Examples

Inline code looks like this: \`const variable = "value";\`

Here's a code block with JavaScript:

\`\`\`javascript
function testFunction() {
  const message = "Hello, world!";
  console.log(message);
  
  // This is a comment
  return {
    status: "success",
    data: {
      value: 42,
      text: message
    }
  };
}

// Event handler example
document.getElementById('button').addEventListener('click', () => {
  alert('Button was clicked!');
});
\`\`\`

Here's a simple code block:

\`\`\`
# This is a simple code block
print("Hello, world!")
# No specific language highlighting
\`\`\`

[This is a link](https://example.com) that you can click.

~~This text has been struck through~~ to indicate deletion.

###### Smallest heading


#### Checklist
- [ ] Option 1
- [ ] Option 2
- [x] Option 3`,
    timestamp: '2022-03-15T12:00:00.000Z',
  },
  {
    title: 'Testing Markdown Editor',
    content: `# Main Heading: Testing Markdown Editor

## Secondary Heading: Features Overview

This paragraph demonstrates **bold text** and *italic text* formatting options. You can also combine them for ***bold italic text*** when needed.

### Third-level heading with some details

Here's a bulleted list of test items:
- First item in the list
- Second item with **bold formatting**
- Third item with *italic text*
  - Nested item one
  - Nested item with \`inline code\`
  - Another nested item

Now for a numbered list:
1. First numbered item
2. Second numbered item
   1. Nested numbered item
   2. Another nested item
3. Third numbered item

> This is a blockquote that can be used for citations or highlighting important text.
> 
> It can span multiple paragraphs if needed.

#### Code Examples

Inline code looks like this: \`const variable = "value";\`

Here's a code block with JavaScript:

\`\`\`javascript
function testFunction() {
  const message = "Hello, world!";
  console.log(message);
  
  // This is a comment
  return {
    status: "success",
    data: {
      value: 42,
      text: message
    }
  };
}

// Event handler example
document.getElementById('button').addEventListener('click', () => {
  alert('Button was clicked!');
});
\`\`\`

Here's a simple code block:

\`\`\`
# This is a simple code block
print("Hello, world!")
# No specific language highlighting
\`\`\`

[This is a link](https://example.com) that you can click.

~~This text has been struck through~~ to indicate deletion.

###### Smallest heading


#### Checklist
- [ ] Option 1
- [ ] Option 2
- [x] Option 3`,
    timestamp: '2022-03-15T12:00:00.000Z',
  },
  {
    title: 'Testing Markdown Editor',
    content: `# Main Heading: Testing Markdown Editor

## Secondary Heading: Features Overview

This paragraph demonstrates **bold text** and *italic text* formatting options. You can also combine them for ***bold italic text*** when needed.

### Third-level heading with some details

Here's a bulleted list of test items:
- First item in the list
- Second item with **bold formatting**
- Third item with *italic text*
  - Nested item one
  - Nested item with \`inline code\`
  - Another nested item

Now for a numbered list:
1. First numbered item
2. Second numbered item
   1. Nested numbered item
   2. Another nested item
3. Third numbered item

> This is a blockquote that can be used for citations or highlighting important text.
> 
> It can span multiple paragraphs if needed.

#### Code Examples

Inline code looks like this: \`const variable = "value";\`

Here's a code block with JavaScript:

\`\`\`javascript
function testFunction() {
  const message = "Hello, world!";
  console.log(message);
  
  // This is a comment
  return {
    status: "success",
    data: {
      value: 42,
      text: message
    }
  };
}

// Event handler example
document.getElementById('button').addEventListener('click', () => {
  alert('Button was clicked!');
});
\`\`\`

Here's a simple code block:

\`\`\`
# This is a simple code block
print("Hello, world!")
# No specific language highlighting
\`\`\`

[This is a link](https://example.com) that you can click.

~~This text has been struck through~~ to indicate deletion.

###### Smallest heading


#### Checklist
- [ ] Option 1
- [ ] Option 2
- [x] Option 3`,
    timestamp: '2022-03-15T12:00:00.000Z',
  },
  {
    title: 'Testing Markdown Editor',
    content: `# Main Heading: Testing Markdown Editor

## Secondary Heading: Features Overview

This paragraph demonstrates **bold text** and *italic text* formatting options. You can also combine them for ***bold italic text*** when needed.

### Third-level heading with some details

Here's a bulleted list of test items:
- First item in the list
- Second item with **bold formatting**
- Third item with *italic text*
  - Nested item one
  - Nested item with \`inline code\`
  - Another nested item

Now for a numbered list:
1. First numbered item
2. Second numbered item
   1. Nested numbered item
   2. Another nested item
3. Third numbered item

> This is a blockquote that can be used for citations or highlighting important text.
> 
> It can span multiple paragraphs if needed.

#### Code Examples

Inline code looks like this: \`const variable = "value";\`

Here's a code block with JavaScript:

\`\`\`javascript
function testFunction() {
  const message = "Hello, world!";
  console.log(message);
  
  // This is a comment
  return {
    status: "success",
    data: {
      value: 42,
      text: message
    }
  };
}

// Event handler example
document.getElementById('button').addEventListener('click', () => {
  alert('Button was clicked!');
});
\`\`\`

Here's a simple code block:

\`\`\`
# This is a simple code block
print("Hello, world!")
# No specific language highlighting
\`\`\`

[This is a link](https://example.com) that you can click.

~~This text has been struck through~~ to indicate deletion.

###### Smallest heading


#### Checklist
- [ ] Option 1
- [ ] Option 2
- [x] Option 3`,
    timestamp: '2022-03-15T12:00:00.000Z',
  },
  {
    title: 'Testing Markdown Editor',
    content: `# Main Heading: Testing Markdown Editor

## Secondary Heading: Features Overview

This paragraph demonstrates **bold text** and *italic text* formatting options. You can also combine them for ***bold italic text*** when needed.

### Third-level heading with some details

Here's a bulleted list of test items:
- First item in the list
- Second item with **bold formatting**
- Third item with *italic text*
  - Nested item one
  - Nested item with \`inline code\`
  - Another nested item

Now for a numbered list:
1. First numbered item
2. Second numbered item
   1. Nested numbered item
   2. Another nested item
3. Third numbered item

> This is a blockquote that can be used for citations or highlighting important text.
> 
> It can span multiple paragraphs if needed.

#### Code Examples

Inline code looks like this: \`const variable = "value";\`

Here's a code block with JavaScript:

\`\`\`javascript
function testFunction() {
  const message = "Hello, world!";
  console.log(message);
  
  // This is a comment
  return {
    status: "success",
    data: {
      value: 42,
      text: message
    }
  };
}

// Event handler example
document.getElementById('button').addEventListener('click', () => {
  alert('Button was clicked!');
});
\`\`\`

Here's a simple code block:

\`\`\`
# This is a simple code block
print("Hello, world!")
# No specific language highlighting
\`\`\`

[This is a link](https://example.com) that you can click.

~~This text has been struck through~~ to indicate deletion.

###### Smallest heading


#### Checklist
- [ ] Option 1
- [ ] Option 2
- [x] Option 3`,
    timestamp: '2022-03-15T12:00:00.000Z',
  },
];

export const News = (): React.ReactElement => {
  const { t } = useTranslation();

  return (
    <>
      <div className={clsx('flex', 'justify-between', 'items-center')}>
        <div className={clsx('text-base', 'font-bold', 'text-primary')}>
          {t('dashboard.news.title')}
        </div>
        <Button kind="link" color="secondary" href="/news">
          {t('dashboard.news.button')}
        </Button>
      </div>
      <Spacer className="h-4" />
      <div className={clsx('grid', 'gap-[23px]')}>
        {response.map((content) => (
          <NewsPost post={content} />
        ))}
      </div>
    </>
  );
};

export default News;
