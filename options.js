// options.js

document.addEventListener('DOMContentLoaded', () => {
    const instanceNameInput = document.getElementById('instance-name');
    const instanceDisplayNameInput = document.getElementById('instance-display-name');
    const addInstanceBtn = document.getElementById('add-instance');
    const removeAllBtn = document.getElementById('remove-all');
    const instanceList = document.querySelector('#instance-list tbody');

    // Load instances from storage and populate the list
    chrome.storage.sync.get('instances', (data) => {
        const instances = data.instances || [];
        updateInstanceList(instances);
    });

    // Function to update the instance list
    const updateInstanceList = (instances) => {
        instanceList.innerHTML = '';
        instances.forEach((instance, index) => {
            const tr = document.createElement('tr');

            // Action column with delete and edit icons
            const actionTd = document.createElement('td');
            actionTd.classList.add('action-icons');

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('icon-btn');
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', () => {
                deleteInstance(index);
            });

            const editBtn = document.createElement('button');
            editBtn.classList.add('icon-btn');
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.addEventListener('click', () => {
                editInstance(index);
            });

            actionTd.appendChild(deleteBtn);
            actionTd.appendChild(editBtn);

            // Instance Name column
            const nameTd = document.createElement('td');
            nameTd.textContent = instance.name;

            // Instance Display Name column
            const displayNameTd = document.createElement('td');
            displayNameTd.textContent = instance.displayName;

            tr.appendChild(actionTd);
            tr.appendChild(nameTd);
            tr.appendChild(displayNameTd);
            instanceList.appendChild(tr);
        });
    };

    // Function to add a new instance
    const addInstance = () => {
        const instanceName = instanceNameInput.value.trim();
        const instanceDisplayName = instanceDisplayNameInput.value.trim();

        if (!instanceName || !instanceDisplayName) {
            alert('Please enter both instance name and display name.');
            return;
        }

        chrome.storage.sync.get('instances', (data) => {
            const instances = data.instances || [];
            if (!instances.some(instance => instance.name === instanceName)) {
                instances.push({ name: instanceName, displayName: instanceDisplayName });
                chrome.storage.sync.set({ instances: instances }, () => {
                    updateInstanceList(instances);
                    instanceNameInput.value = ''; // Clear the input field
                    instanceDisplayNameInput.value = ''; // Clear the input field
                });
            } else {
                alert('Instance already exists.');
            }
        });
    };

    // Function to delete an instance
    const deleteInstance = (index) => {
        chrome.storage.sync.get('instances', (data) => {
            const instances = data.instances || [];
            instances.splice(index, 1);
            chrome.storage.sync.set({ instances: instances }, () => {
                updateInstanceList(instances);
            });
        });
    };

    // Function to edit an instance
    const editInstance = (index) => {
        chrome.storage.sync.get('instances', (data) => {
            const instances = data.instances || [];
            const instance = instances[index];
            instanceNameInput.value = instance.name;
            instanceDisplayNameInput.value = instance.displayName;
            deleteInstance(index);
        });
    };

    // Function to remove all instances
    const removeAllInstances = () => {
        chrome.storage.sync.set({ instances: [] }, () => {
            updateInstanceList([]);
        });
    };

    // Event listener for adding an instance
    addInstanceBtn.addEventListener('click', addInstance);

    // Event listener for removing all instances
    removeAllBtn.addEventListener('click', removeAllInstances);
});
