import { type FormEvent, useRef } from 'react';
import {
  FormWatchProvider,
  useFormStore,
  useFormWatch,
  type WatchValue,
} from './3_formWatchStore';

type FormElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

const readValue = ($el: FormElement): WatchValue => {
  if ($el instanceof HTMLInputElement) {
    if ($el.type === 'checkbox') return $el.checked;
    if ($el.type === 'file') return $el.files?.[0];
  }
  return $el.value;
};

// password와 passwordConfirm만 구독한다. 이름이나 약관 필드를 수정해도
// 이 컴포넌트는 다시 렌더링되지 않는다.
const PasswordStatus = () => {
  const password = useFormWatch('password', '');
  const passwordConfirm = useFormWatch('passwordConfirm', '');
  const renderCount = useRef(0);
  renderCount.current += 1;

  if (!passwordConfirm) {
    return <small> 비밀번호 상태 렌더: {renderCount.current}회</small>;
  }

  const matches = password === passwordConfirm;
  return (
    <span className={matches ? '' : 'errorMsg'}>
      {' '}
      {matches ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
      <small> (렌더: {renderCount.current}회)</small>
    </span>
  );
};

// name만 구독하는 별도 컴포넌트다. 다른 필드를 입력해도 다시 렌더링되지 않는다.
const NamePreview = () => {
  const name = useFormWatch('name', '');
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <p>
      이름 미리보기: <strong>{name || '(입력 전)'}</strong>{' '}
      <small>(렌더: {renderCount.current}회)</small>
    </p>
  );
};

const Greeting = () => {
  const name = useFormWatch('name', '');

  return <sub>안녕하세요 {name || '사용자'}님</sub>;
};

const SubscribedForm = () => {
  const store = useFormStore();
  const renderCount = useRef(0);
  renderCount.current += 1;

  const handleInput = (e: FormEvent<HTMLFormElement>) => {
    const $el = e.target;
    if (
      !($el instanceof HTMLInputElement) &&
      !($el instanceof HTMLTextAreaElement) &&
      !($el instanceof HTMLSelectElement)
    ) {
      return;
    }
    if (!$el.name) return;

    // DOM의 최신 값을 구독 Store에 전달한다. setState를 사용하지 않으므로
    // SubscribedForm 전체는 다시 렌더링되지 않는다.
    store.set($el.name, readValue($el));

    // 서로 의존하는 두 필드의 네이티브 customValidity도 같이 갱신한다.
    const $form = e.currentTarget;
    const $password = $form.elements.namedItem('password') as HTMLInputElement;
    const $confirm = $form.elements.namedItem(
      'passwordConfirm',
    ) as HTMLInputElement;
    if ($el === $password || $el === $confirm) {
      $confirm.setCustomValidity(
        !$confirm.value || $confirm.value === $password.value
          ? ''
          : '비밀번호가 일치하지 않습니다.',
      );
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(Object.fromEntries(new FormData(e.currentTarget)));
  };

  return (
    <>
      <p>
        Form 본체 렌더: {renderCount.current}회 — 아래 입력을 바꿔도 증가하지
        않습니다.
      </p>
      <form id="registerForm3" onInput={handleInput} onSubmit={handleSubmit}>
        <fieldset>
          <legend>구독형 비제어 회원가입</legend>
          <p>
            <label htmlFor="watched_name">이름: </label>
            <input id="watched_name" name="name" required minLength={2} />
          </p>
          <NamePreview />
          <p>
            <label htmlFor="watched_password">비밀번호: </label>
            <input
              id="watched_password"
              name="password"
              type="password"
              required
              autoComplete="off"
            />
          </p>
          <p>
            <label htmlFor="watched_password_confirm">비밀번호 확인: </label>
            <input
              id="watched_password_confirm"
              name="passwordConfirm"
              type="password"
              required
              autoComplete="off"
            />
            <PasswordStatus />
          </p>
          <p>
            <input id="watched_agree" name="agree" type="checkbox" required />
            <label htmlFor="watched_agree">약관에 동의합니다</label>
          </p>
        </fieldset>
      </form>
      <button type="submit" form="registerForm3">
        제출
      </button>
    </>
  );
};

const Form3 = () => (
  <FormWatchProvider>
    <h3>
      #3. React<sub>구독형 비제어 폼(useWatch 직접 구현)</sub> <Greeting />
    </h3>
    <SubscribedForm />
  </FormWatchProvider>
);

export default Form3;
