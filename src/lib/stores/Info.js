import { writable } from 'svelte/store';

export const persist_storage = (key, initValue) => {
    const store = writable(initValue);

    if (typeof window !== 'undefined') {
        const json = localStorage.getItem(key);
        if (json) {
            store.set(JSON.parse(json));
        }

        store.subscribe((val) => {
            localStorage.setItem(key, JSON.stringify(val));
        });
    }

    return store;
};

export const access_token   = persist_storage("access_token", "");          // 로그인 토큰
export const user_email     = persist_storage("user_email", "");            // 로그인 유저 이메일
export const user_id        = persist_storage("user_id", "");               // 로그인 유저 id
export const user_nm        = persist_storage("user_nm", "");               // 로그인 유저 이름
export const is_login       = persist_storage("is_login", false);           // 로그인 여부
export const page           = persist_storage("page", 0);                   // 게시판 마지막 페이지 번호
export const keyword        = persist_storage("keyword", "")                // 검색 키워드
export const permissions    = persist_storage("permissions", "")                // 사용자 권한


export function resetUserStores() { // 사용자 관련 스토어 초기화 함수
    access_token.set("");
    user_email.set("");
    user_id.set("");
    user_nm.set("");
    permissions.set("");
    is_login.set(false);
}

