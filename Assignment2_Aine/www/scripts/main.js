/* eslint-env es6 */
(function() {
    let baseURL = 'http://148.75.251.185:8888';
    if (document.readyState != "loading") {
        app();
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            app();
        }, false);
    }

    function getStudents() {
        let config = {
            method: 'GET',
            headers: new Headers({}),
        };

        let request = new Request(`${baseURL}/students`, config);
        fetch(request)
            .then(function(res) {
                if (res.status == 200)
                    return res.json();
                else
                    throw new Error('Something went wrong on api server!');
            })
            .then(function(res) {
                console.log(res);
                for (let student of res)
                    populateStudent(student);

            let modal = new SimpleModal();
            })
            .catch(function(err) {
                console.warn("Couldn't fetch students list");
                console.log(err);
            });
    }

    function populateStudent(student) {
            let studentTemplate = document.createElement('div');
            let modalContent = document.createElement('div');

            // student name
            studentTemplate.classList.add('person');
            studentTemplate.innerHTML = `
                                    <div data-modal='{"contentId":"modal-student-${student.id}"}' class="info">
                                        ${student.first_name} <br> ${student.last_name}
                                    </div>
                                    <div data-modal-content="modal-student-${student.id}">
                                    </div>
                                    `;


            //modal content
            let profileImg = document.createElement('img');
            let discription = document.createElement('div');
            modalContent.appendChild(profileImg);
            modalContent.appendChild(discription);
            modalContent.dataset.modalContent = "modal-student-" + student.id;

            studentTemplate.addEventListener('click', function() {
                getextrastudentinfo(student)
                    .then(function(student) {
                        profileImg.src = baseURL + student.profile_picture;
                        discription.innerHTML=student.excerpt;
                    })
            });


            // Add everything
            let mainWrapper = document.getElementById('main');
            mainWrapper.appendChild(studentTemplate);
            mainWrapper.appendChild(modalContent);
        }

                                    // <div class="description">${student.excerpt}</div>
                                    // <div class="thumb">
                                    //     <img src="${baseURL}${student.profile_picture}">
                                    // </div>
                                    //     <nav class="social">
                                    //     ${(links => {
                                    //         let result = '';
                                    //         for(let link of links){
                                    //             let icon = "";
                                    //             if( /github.com/.test(link.url) ){
                                    //                 icon = "svg/github.svg";
                                    //             }else if(/linkedin.com/.test(link.url) ){
                                    //                 icon = "svg/linkedin.svg";
                                    //             }else if (/instagram.com/.test(link.url) ){
                                    //                 icon = "svg/instagram.svg";
                                    //             }
                                    //             let linkTemplate = `<a href ="${link.url}"><img src = "${icon}"></a>`;
                                    //             result +=  linkTemplate;
                                    //         }
                                    //         return result;
                                    //     })(student.links)} 
                                    //     </nav> 

    function getextrastudentinfo(student) {
        let config = {
            method: 'GET',
            headers: new Headers({}),
        };

        let request = new Request(`${baseURL}/students/${student.id}`, config);
        return fetch(request)
            .then(function(res) {
                if (res.status == 200)
                    return res.json();
                else
                    throw new Error('Something went wrong on api server!');
            })
            .catch(function(err) {
                console.warn("Couldn't fetch a student!");
                console.log(err);
            });

    }

    function setupProfileSubmissionForm() {
        let profileSubmissionForm = document.querySelector('#profile-submission-form');
        let profileThumb = profileSubmissionForm.querySelector("#profile-picture");
        profileThumb.addEventListener('change', function(evnt) {
            let thumb = this.parentNode.querySelector('img');
            var file = this.files;

            function readAndPreview(file) {
                if (/\.(jpe?g|png)$/i.test(file.name)) {
                    var reader = new FileReader();
                    reader.addEventListener("load", function() {
                        thumb.title = file.name;
                        thumb.src = this.result;
                    }, false);
                    reader.readAsDataURL(file);
                }
            }
            if (file) {
                [].forEach.call(file, readAndPreview);
            }

        }, false);
        profileSubmissionForm.addEventListener('click', function(evnt) {
            let target = evnt.target || evnt.srcElement;
            if (target.classList.contains('add-more-links')) {
                if (target.classList.contains('btn-danger')) {
                    target.parentNode.remove(); // removing the whole link
                } else {

                    let newLink = target.parentNode.cloneNode(true);
                    target.parentNode.parentNode.appendChild(newLink);
                    target.classList.add('btn-danger');
                    target.classList.remove('btn-default');
                    target.innerText = '✘';

                }
            }

        }, false);

        profileSubmissionForm.addEventListener('submit', function(evnt) {
            evnt.preventDefault();
            let form = this;
            if (form.querySelector('.alert'))
                form.removeChild(form.querySelector('.alert'));

            var formData = new FormData(form);
            
            let config = {
                method: 'POST',
                headers: new Headers({}),
                body: formData
            };

            let request = new Request(`${baseURL}/students`, config);

            form.querySelector('fieldset').setAttribute('disabled', '');
            fetch(request)
                .then(function(res) {
                    if (res.status == 200)
                        return res.json();
                    else
                        throw new Error('Something went wrong on api server!');
                })
                .then(function(res) {
                    let successTemplate = document.createElement('template');
                    successTemplate.innerHTML = `<div class="alert alert-success" role="alert">
                                                            <strong>Great!</strong> Your profile was saved!
                                                        </div>`;
                    let warningTemplate = document.createElement('template');
                    warningTemplate.innerHTML = `<div class="alert alert-warning" role="alert">
                                                            <strong>Hey!</strong>Your profile was updated! submit again to update it.
                                                        </div>`;

                    form.appendChild(successTemplate.content.firstChild);
                    form.querySelector('fieldset').removeAttribute('disabled');
                })
                .catch(function(err) {
                    let errorTemplate = document.createElement('template');
                    errorTemplate.innerHTML = `<div class="alert alert-danger" role="alert">
                                                        <strong>Oh snap!</strong> Couldn't save your profile!
                                                        </div>`;

                    form.appendChild(errorTemplate.content.firstChild);
                    form.querySelector('fieldset').removeAttribute('disabled');
                    console.log(err);
                });
        }, false);
    }

    function app() {
        getStudents();
        setupProfileSubmissionForm();
    }
})();