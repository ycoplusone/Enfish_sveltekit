// operation : get , post , put ,delete  처리
// url : 오청 url백엔드 서버의호스트명이후 url경로만 전달
// params : 인자값 전달 ex) {page:1 ,size:10, name : "forgetme"}
// success_callback : 성공시 호출 함수 ex)생략
// failure_callback : 실패시 호출 함수 ex)생략

import qs from "qs"

import { access_token , user_nm , user_id , user_email , is_login , resetUserStores }     from "$lib/stores/Info.js";    // 스토어
import { get }      from 'svelte/store'
import { goto }     from '$app/navigation'; // 페이지 이동


const fastapi = (operation, url, params, success_callback, failure_callback) => {
    let method = operation
    let content_type = 'application/json'
    let body = JSON.stringify(params)

    if(operation === 'login') {
        method = 'post'
        content_type = 'application/x-www-form-urlencoded'
        body = qs.stringify(params)
    }    

    
    let _url = import.meta.env.VITE_SERVER_URL + url;      //let _url = 'http://127.0.0.1:8000'+url    
    //console.log("_url:", _url)
    if(method === 'get') {
        _url += "?" + new URLSearchParams(params)
    }

    let options = {
        method: method,
        headers: {
            "Content-Type": content_type
        }
    }
    
    const _access_token = get(access_token)
    if (_access_token) {
        options.headers["Authorization"] = "Bearer " + _access_token
    }    

    if (method !== 'get') {
        options['body'] = body
    }

    fetch(_url, options)
        .then(response => {
            if(response.status === 204) {  // No content
                if(success_callback) {
                    success_callback();
                }
                return
            }            
            response.json()
                .then(json => {
                    if(response.status >= 200 && response.status < 300) {  // 200 ~ 299
                        if(success_callback) {
                            success_callback(json)
                        }
                    }else if(operation !== 'login' && response.status === 401) { // token time out
                        resetUserStores();
                        /*
                        access_token.set('');
                        user_nm.set('');
                        user_id.set('');
                        user_email.set('');
                        is_login.set(false);
                        */
                        alert("로그인이 필요합니다.");
                        goto('/');
                    }else {
                        if (failure_callback) {
                            failure_callback(json)
                        }else {
                            alert(JSON.stringify(json))
                        }
                    }
                })
                .catch(error => {
                    alert(JSON.stringify(error))
                })
        })
}

export default fastapi
