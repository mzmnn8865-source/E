export function bindGroupEditor(container: HTMLElement, render: (source: string) => string) {
  const textarea = container.querySelector<HTMLTextAreaElement>('textarea[name="body"]');
  const preview = container.querySelector<HTMLElement>('[data-editor-preview], #post-preview');
  if (!textarea || !preview) return;
  const refresh = () => {
    preview.innerHTML = textarea.value.trim() ? render(textarea.value) : '<p class="muted">پیش‌نمایش متن اینجا نمایش داده می‌شود.</p>';
  };
  textarea.addEventListener('input', refresh);
  container.querySelectorAll<HTMLButtonElement>('.post-md-toolbar button').forEach(button => {
    button.setAttribute('aria-label', button.title || button.textContent || 'قالب‌بندی متن');
    button.addEventListener('click', () => {
      const start = textarea.selectionStart, end = textarea.selectionEnd;
      const selected = textarea.value.slice(start, end) || 'متن شما';
      let text = '';
      let from = start;
      let to = end;
      if (button.dataset.line !== undefined) {
        from = start === 0 ? 0 : textarea.value.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = textarea.value.indexOf('\n', Math.max(start, end - 1));
        to = lineEnd === -1 ? textarea.value.length : lineEnd;
        text = textarea.value.slice(from, to).split('\n').map(line => button.dataset.line + line).join('\n');
      } else if (button.dataset.wrap !== undefined) {
        text = `${button.dataset.wrap}${selected}${button.dataset.after || button.dataset.wrap}`;
      } else if (button.hasAttribute('data-code')) {
        text = '\n```text\n' + selected + '\n```\n';
      } else if (button.hasAttribute('data-image')) {
        text = `![${selected}](https://)`;
      } else if (button.hasAttribute('data-video')) {
        text = `[ویدیو](https://)`;
      }
      if (text) {
        textarea.setRangeText(text, from, to, 'select');
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.focus();
      }
    });
  });
  refresh();
}
